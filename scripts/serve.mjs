#!/usr/bin/env node
// Serves dist/ the way Vercel will: its trailing-slash redirects, the 404 page, compression, byte ranges for
// video, and the headers from vercel.json (including host conditions). Used by Playwright and Lighthouse CI,
// so tests run against the real headers and Content-Security-Policy.
// Usage: node scripts/serve.mjs [--port 4321] [--host 127.0.0.1]
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { DIST, ROOT } from './lib/site.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const port = Number(arg('port', process.env.PORT ?? 4321));
const host = arg('host', '127.0.0.1');

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('serve: dist/ has no build. Run `npm run build` first.');
  process.exit(1);
}

const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.vtt': 'text/vtt; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.zip': 'application/zip',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.webmanifest', '.xml', '.txt', '.vtt', '.svg']);

/** Turns a Vercel `source` pattern into a RegExp. Supports literal segments, `(.*)` groups and `:name` params. */
function sourceToRegExp(source) {
  let pattern = '';
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '(') {
      const end = source.indexOf(')', i);
      pattern += source.slice(i, end + 1);
      i = end;
    } else if (c === ':') {
      const m = /^:([A-Za-z0-9_]+)(\*)?/.exec(source.slice(i));
      pattern += m[2] ? '(.*)' : '([^/]+)';
      i += m[0].length - 1;
    } else {
      pattern += c.replace(/[.+?^${}|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${pattern}$`);
}

function conditionMatches(cond, req) {
  if (cond.type === 'host') {
    const hostHeader = (req.headers.host ?? '').replace(/:\d+$/, '');
    return new RegExp(`^${cond.value}$`).test(hostHeader);
  }
  if (cond.type === 'header') {
    const value = req.headers[cond.key.toLowerCase()];
    return cond.value === undefined ? value !== undefined : new RegExp(`^${cond.value}$`).test(value ?? '');
  }
  return false;
}

const headerRules = (vercel.headers ?? []).map((rule) => ({ ...rule, re: sourceToRegExp(rule.source) }));

/** Vercel applies a rule when every `has` condition matches and no `missing` condition does. */
function vercelHeaders(pathname, req) {
  const out = {};
  for (const rule of headerRules) {
    if (!rule.re.test(pathname)) continue;
    if (!(rule.has ?? []).every((c) => conditionMatches(c, req))) continue;
    if ((rule.missing ?? []).some((c) => conditionMatches(c, req))) continue;
    for (const { key, value } of rule.headers) out[key.toLowerCase()] = value;
  }
  return out;
}

/**
 * Vercel's `"trailingSlash": true` (routing-utils, convertTrailingSlash): add a slash when the last segment has
 * no dot, remove one after a file name, and leave /.well-known/ alone. Returns the redirect target, or null.
 */
function trailingSlashRedirect(pathname, search) {
  if (!vercel.trailingSlash || /^\/\.well-known(?:\/.*)?$/.test(pathname)) return null;
  const add = /^\/((?:[^/]+\/)*[^/.]+)$/.exec(pathname);
  if (add) return `/${add[1]}/${search}`;
  const strip = /^\/((?:[^/]+\/)*[^/]+\.\w+)\/$/.exec(pathname);
  if (strip) return `/${strip[1]}${search}`;
  return null;
}

function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const full = join(DIST, normalize(decoded));
  if (!full.startsWith(DIST + sep) && full !== DIST) return null;
  if (existsSync(full) && statSync(full).isFile()) return full;
  if (existsSync(join(full, 'index.html'))) return join(full, 'index.html');
  return null;
}

// Compressed bodies, cached by file, encoding and modification time, so a request costs what it does on a CDN.
const compressed = new Map();
function compress(file, encoding) {
  const { mtimeMs } = statSync(file);
  const key = `${file}|${encoding}`;
  const hit = compressed.get(key);
  if (hit && hit.mtimeMs === mtimeMs) return hit.body;
  const raw = readFileSync(file);
  const body =
    encoding === 'br' ? brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }) : gzipSync(raw, { level: 9 });
  compressed.set(key, { mtimeMs, body });
  return body;
}

/** A single byte range from a Range header, or null to answer the whole file (RFC 9110 §14.2). */
function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header ?? '');
  if (!m || (!m[1] && !m[2])) return null;
  if (!m[1]) {
    const length = Math.min(Number(m[2]), size);
    return { start: size - length, end: size - 1 };
  }
  const start = Number(m[1]);
  const end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (m[2] && Number(m[2]) < start) return null; // invalid: ignore it
  return { start, end };
}

function send(req, res, status, file, extraHeaders = {}) {
  const ext = extname(file);
  const headers = { 'content-type': TYPES[ext] ?? 'application/octet-stream', ...extraHeaders };
  const size = statSync(file).size;

  if (status === 200 && !COMPRESSIBLE.has(ext) && req.headers.range) {
    const range = parseRange(req.headers.range, size);
    if (range && range.start >= size) {
      res.writeHead(416, { 'content-range': `bytes */${size}` });
      return res.end();
    }
    if (range) {
      res.writeHead(206, {
        ...headers,
        'accept-ranges': 'bytes',
        'content-range': `bytes ${range.start}-${range.end}/${size}`,
        'content-length': range.end - range.start + 1,
      });
      if (req.method === 'HEAD') return res.end();
      return createReadStream(file, { start: range.start, end: range.end }).pipe(res);
    }
  }

  const accept = req.headers['accept-encoding'] ?? '';
  if (COMPRESSIBLE.has(ext) && /\b(br|gzip)\b/.test(accept)) {
    const encoding = /\bbr\b/.test(accept) ? 'br' : 'gzip';
    const body = compress(file, encoding);
    res.writeHead(status, { ...headers, 'content-encoding': encoding, 'content-length': body.length, vary: 'Accept-Encoding' });
    return res.end(req.method === 'HEAD' ? undefined : body);
  }
  res.writeHead(status, { ...headers, 'accept-ranges': 'bytes', 'content-length': size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

function handle(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const { pathname } = url;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    return res.end();
  }
  const redirect = trailingSlashRedirect(pathname, url.search);
  if (redirect) {
    res.writeHead(308, { location: redirect });
    return res.end();
  }
  // Vercel's edge serves the Web Analytics and Speed Insights scripts; locally they're empty.
  if (/^\/_vercel\/(insights|speed-insights)\/script\.js$/.test(pathname)) {
    res.writeHead(200, { 'content-type': TYPES['.js'], 'content-length': 0 });
    return res.end();
  }
  const headers = vercelHeaders(pathname, req);
  const file = resolveFile(pathname);
  if (file) return send(req, res, 200, file, headers);
  const notFound = join(DIST, '404.html');
  if (existsSync(notFound)) return send(req, res, 404, notFound, headers);
  res.writeHead(404, { 'content-type': TYPES['.txt'] });
  res.end('Not found');
}

const server = createServer((req, res) => {
  try {
    handle(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
});

server.listen(port, host, () => {
  console.log(`Serving dist/ at http://${host}:${port}/`);
});
