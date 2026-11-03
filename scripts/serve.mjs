#!/usr/bin/env node
// Serves dist/ the way Vercel will: trailing-slash redirects, the 404 page, compression, byte ranges for
// video, and the headers from vercel.json (including host conditions). Used by Playwright and Lighthouse CI,
// so tests run against the real Content-Security-Policy.
// Usage: node scripts/serve.mjs [--port 4321] [--host 127.0.0.1]
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const port = Number(arg('port', process.env.PORT ?? 4321));
const host = arg('host', '127.0.0.1');

const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
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
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.webmanifest', '.xml', '.txt', '.svg']);

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

function hasMatches(conditions, req) {
  if (!conditions) return true;
  return conditions.every((cond) => {
    if (cond.type === 'host') {
      const hostHeader = (req.headers.host ?? '').replace(/:\d+$/, '');
      return new RegExp(`^${cond.value}$`).test(hostHeader);
    }
    if (cond.type === 'header') {
      const value = req.headers[cond.key.toLowerCase()];
      return cond.value === undefined ? value !== undefined : new RegExp(`^${cond.value}$`).test(value ?? '');
    }
    return false;
  });
}

const headerRules = (vercel.headers ?? []).map((rule) => ({ ...rule, re: sourceToRegExp(rule.source) }));

function vercelHeaders(pathname, req) {
  const out = {};
  for (const rule of headerRules) {
    if (rule.re.test(pathname) && hasMatches(rule.has, req) && !(rule.missing && hasMatches(rule.missing, req))) {
      for (const { key, value } of rule.headers) out[key.toLowerCase()] = value;
    }
  }
  return out;
}

function resolveFile(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = join(dist, safe);
  if (!full.startsWith(dist + sep) && full !== dist) return null;
  if (existsSync(full) && statSync(full).isFile()) return full;
  if (existsSync(join(full, 'index.html'))) return join(full, 'index.html');
  return null;
}

function send(req, res, status, file, extraHeaders = {}) {
  const ext = extname(file);
  const headers = {
    'content-type': TYPES[ext] ?? 'application/octet-stream',
    ...extraHeaders,
  };
  const size = statSync(file).size;
  const range = req.headers.range;
  if (range && status === 200 && !COMPRESSIBLE.has(ext)) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
      const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (start <= end && start < size) {
        res.writeHead(206, {
          ...headers,
          'accept-ranges': 'bytes',
          'content-range': `bytes ${start}-${end}/${size}`,
          'content-length': end - start + 1,
        });
        if (req.method === 'HEAD') return res.end();
        return createReadStream(file, { start, end }).pipe(res);
      }
      res.writeHead(416, { 'content-range': `bytes */${size}` });
      return res.end();
    }
  }
  const accept = req.headers['accept-encoding'] ?? '';
  if (COMPRESSIBLE.has(ext) && /\b(br|gzip)\b/.test(accept)) {
    const body = readFileSync(file);
    const useBr = /\bbr\b/.test(accept);
    const packed = useBr
      ? brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } })
      : gzipSync(body, { level: 9 });
    res.writeHead(status, {
      ...headers,
      'content-encoding': useBr ? 'br' : 'gzip',
      'content-length': packed.length,
      vary: 'Accept-Encoding',
    });
    return res.end(req.method === 'HEAD' ? undefined : packed);
  }
  res.writeHead(status, { ...headers, 'accept-ranges': 'bytes', 'content-length': size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const { pathname } = url;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    return res.end();
  }
  // Vercel's "trailingSlash": true redirects any extensionless path without a slash.
  if (vercel.trailingSlash && !pathname.endsWith('/') && !extname(pathname)) {
    res.writeHead(308, { location: `${pathname}/${url.search}` });
    return res.end();
  }
  const headers = vercelHeaders(pathname, req);
  const file = resolveFile(pathname);
  if (file) return send(req, res, 200, file, headers);
  const notFound = join(dist, '404.html');
  if (existsSync(notFound)) return send(req, res, 404, notFound, headers);
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('Not found');
});

server.listen(port, host, () => {
  console.log(`Serving dist/ at http://${host}:${port}/`);
});
