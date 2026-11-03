#!/usr/bin/env node
// Checks the production build in dist/: every route exists with the right language and one h1, titles and
// descriptions are unique and within limits, internal links and fragments resolve, the sitemap matches
// handoff/routes.json, robots.txt is right, banned claims never reach a page, and every page is inside the
// budgets in handoff/SPEC.md §9. Exits 1 on any failure.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, posix, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ELEMENT_NODE, parse, TEXT_NODE, walkSync } from 'ultrahtml';
import { querySelector, querySelectorAll } from 'ultrahtml/selector';
import { DIST, expectedPages, PENDING_ROUTE_IDS, routes, SITE_URL } from './lib/site.mjs';

const KB = 1024;
const BUDGET = {
  /** Home's first-load JavaScript, including the 2.4 KB of Vercel loaders. */
  jsHome: 30 * KB,
  /** Every other page's first-load JavaScript, including the Vercel loaders. */
  jsOther: 8 * KB,
  /** Effects loaded after the page is interactive. */
  lazyEffects: 40 * KB,
  css: 25 * KB,
  fontPreloads: 2,
  fontPreloadBytes: 60 * KB,
  homeFirstLoad: 500 * KB,
};
/** The two Vercel loader scripts (Web Analytics and Speed Insights), counted once they're on a page. */
const VERCEL_LOADERS = 2.4 * KB;
const VERCEL_SCRIPT = /^\/_vercel\/(insights|speed-insights)\//;

// Phrases from .claude/rules/copy.md that must never reach a page, in any language.
const NEVER_SAY = [
  /coming soon/i, /launching soon/i, /\bwaitlist\b/i, /\bfifa\b/i, /\buefa\b/i, /world cup 2026/i,
  /чм[- ]?2026/i, /скоро (выйдет|запуск)/i, /\bofficial(ly)?\b/i, /официальн/i, /պաշտոնական/,
  /\bad-free\b/i, /thousands of words/i, /тысячи слов/i, /10,000\+/, /online multiplayer/i,
  /add your own words/i, /custom decks/i, /\bswipe/i, /team colou?rs/i, /at the app store/i,
  /apple app store/i, /\bdownloadable\b/i, /\bultimate\b/i, /#1\b/,
];

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const fmt = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

if (!existsSync(DIST)) {
  console.error('check-site: dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------------------
// Helpers

function textOf(node) {
  let out = '';
  walkSync(node, (n) => {
    if (n.type === TEXT_NODE) out += n.value;
  });
  return out.replace(/\s+/g, ' ').trim();
}

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&');
}

const attr = (node, name) => (node?.attributes?.[name] === undefined ? undefined : decodeEntities(String(node.attributes[name])));

/** Where a site path lives in dist/, or null if nothing is there. */
function distFileFor(pathname) {
  const clean = decodeURIComponent(pathname);
  if (clean.endsWith('/')) {
    const file = join(DIST, clean, 'index.html');
    return existsSync(file) ? file : null;
  }
  const file = join(DIST, clean);
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

function allFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? allFiles(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const idsByFile = new Map();
function idsIn(file) {
  if (!idsByFile.has(file)) {
    const ids = new Set();
    walkSync(parse(readFileSync(file, 'utf8')), (n) => {
      if (n.type === ELEMENT_NODE && n.attributes?.id) ids.add(String(n.attributes.id));
    });
    idsByFile.set(file, ids);
  }
  return idsByFile.get(file);
}

/** Static imports (first load) and dynamic imports (lazy) of a built module, followed recursively. */
function moduleGraph(entry, seen = new Set(), lazy = new Set()) {
  if (seen.has(entry)) return { seen, lazy };
  seen.add(entry);
  const file = join(DIST, entry);
  if (!existsSync(file)) return { seen, lazy };
  const code = readFileSync(file, 'utf8');
  const dir = posix.dirname(entry);
  const resolve = (spec) => (spec.startsWith('/') ? spec : posix.join(dir, spec));
  for (const m of code.matchAll(/\bimport\s*(?:[\w$*{}\s,]+\s*from\s*)?["']([^"']+\.m?js)["']/g)) {
    moduleGraph(resolve(m[1]), seen, lazy);
  }
  for (const m of code.matchAll(/\bimport\(\s*["']([^"']+\.m?js)["']\s*\)/g)) lazy.add(resolve(m[1]));
  return { seen, lazy };
}

// ---------------------------------------------------------------------------------------------------------
// 1. Every route is built, and nothing else is.

const pages = expectedPages();
const expectedFiles = new Set(pages.map((p) => p.file));
for (const p of pages) {
  if (!existsSync(p.file)) fail(p.path, `missing from dist/ (route ${p.id}, ${p.lang})`);
}
for (const file of allFiles(DIST).filter((f) => f.endsWith('.html'))) {
  const rel = '/' + relative(DIST, file).split('\\').join('/');
  if (rel === '/404.html') continue;
  if (!expectedFiles.has(file)) fail(rel, 'built page is not in handoff/routes.json');
}
if (!existsSync(join(DIST, '404.html'))) fail('/404.html', 'missing');

// ---------------------------------------------------------------------------------------------------------
// 2. Per page: language, one h1, title and description, banned claims, links.

const titles = new Map();
const descriptions = new Map();
const budgetRows = [];

const htmlTargets = [...pages.filter((p) => existsSync(p.file)), { id: 'notFound', lang: 'en', path: '/404.html', file: join(DIST, '404.html') }];

for (const page of htmlTargets) {
  if (!existsSync(page.file)) continue;
  const html = readFileSync(page.file, 'utf8');
  const doc = parse(html);
  const where = page.path;
  const isNotFound = page.id === 'notFound';

  const htmlEl = querySelector(doc, 'html');
  if (attr(htmlEl, 'lang') !== page.lang) fail(where, `<html lang="${attr(htmlEl, 'lang')}">, expected "${page.lang}"`);

  const h1s = querySelectorAll(doc, 'h1');
  if (!isNotFound && h1s.length !== 1) fail(where, `${h1s.length} h1 elements, expected exactly 1`);
  if (h1s.some((h) => !textOf(h))) fail(where, 'empty h1');

  const title = textOf(querySelector(doc, 'title') ?? { children: [] });
  const description = attr(querySelector(doc, 'meta[name="description"]'), 'content') ?? '';
  if (!title) fail(where, 'missing <title>');
  if (!isNotFound) {
    if ([...title].length > 60) fail(where, `title is ${[...title].length} characters (max 60)`);
    const d = [...description].length;
    if (d < 70 || d > 160) fail(where, `meta description is ${d} characters (70–160)`);
    if (titles.has(title)) fail(where, `title also used on ${titles.get(title)}`);
    if (descriptions.has(description)) fail(where, `description also used on ${descriptions.get(description)}`);
    titles.set(title, where);
    descriptions.set(description, where);
  }

  const bodyText = textOf(querySelector(doc, 'body') ?? doc);
  for (const re of NEVER_SAY) {
    const m = re.exec(`${title} ${description} ${bodyText}`);
    if (m) fail(where, `banned phrase "${m[0]}" (.claude/rules/copy.md)`);
  }

  // Links: internal targets must exist, fragments must point at an id, no plain-http links.
  for (const a of querySelectorAll(doc, 'a[href]')) {
    const href = attr(a, 'href');
    if (!href) {
      fail(where, 'empty href');
      continue;
    }
    if (/^(mailto|tel):/.test(href)) continue;
    if (/^http:\/\//.test(href)) {
      fail(where, `insecure link ${href}`);
      continue;
    }
    if (/^https?:\/\//.test(href)) {
      if (href.startsWith(SITE_URL)) fail(where, `internal link written as an absolute URL: ${href}`);
      continue;
    }
    const url = new URL(href, `${SITE_URL}${where}`);
    if (url.pathname === where.replace(/index\.html$/, '') || href.startsWith('#')) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && !idsIn(page.file).has(id)) fail(where, `link to #${id}, which isn't on the page`);
      continue;
    }
    if (!url.pathname.endsWith('/') && !extname(url.pathname)) {
      fail(where, `link to ${url.pathname} lacks the trailing slash`);
      continue;
    }
    const target = distFileFor(url.pathname);
    if (!target) {
      const pendingTarget = Object.entries(routes.pages).some(
        ([id, byLang]) => PENDING_ROUTE_IDS.has(id) && Object.values(byLang).includes(url.pathname),
      );
      if (!pendingTarget) fail(where, `broken link to ${url.pathname}`);
      continue;
    }
    const id = decodeURIComponent(url.hash.slice(1));
    if (id && target.endsWith('.html') && !idsIn(target).has(id)) {
      fail(where, `link to ${url.pathname}#${id}, which has no such id`);
    }
  }

  // Budgets.
  const scripts = querySelectorAll(doc, 'script');
  const firstLoadModules = new Set();
  const lazyModules = new Set();
  let inlineJs = 0;
  let vercel = false;
  for (const s of scripts) {
    const type = attr(s, 'type') ?? '';
    if (type === 'application/ld+json' || type === 'application/json') continue;
    const src = attr(s, 'src');
    if (src) {
      if (VERCEL_SCRIPT.test(src)) {
        vercel = true;
        continue;
      }
      if (/^https?:\/\//.test(src)) {
        fail(where, `third-party script ${src}`);
        continue;
      }
      const { seen, lazy } = moduleGraph(new URL(src, `${SITE_URL}${where}`).pathname);
      seen.forEach((m) => firstLoadModules.add(m));
      lazy.forEach((m) => lazyModules.add(m));
    } else {
      inlineJs += gz(Buffer.from(textOf(s) || s.children?.map((c) => c.value ?? '').join('') || ''));
    }
  }
  for (const link of querySelectorAll(doc, 'link[rel="modulepreload"]')) {
    const { seen, lazy } = moduleGraph(new URL(attr(link, 'href'), `${SITE_URL}${where}`).pathname);
    seen.forEach((m) => firstLoadModules.add(m));
    lazy.forEach((m) => lazyModules.add(m));
  }
  const lazyOnly = new Set();
  for (const m of lazyModules) {
    const { seen } = moduleGraph(m);
    seen.forEach((x) => !firstLoadModules.has(x) && lazyOnly.add(x));
  }
  const jsBytes =
    [...firstLoadModules].reduce((sum, m) => sum + (existsSync(join(DIST, m)) ? gz(readFileSync(join(DIST, m))) : 0), 0) +
    inlineJs +
    (vercel ? VERCEL_LOADERS : 0);
  const lazyBytes = [...lazyOnly].reduce((sum, m) => sum + (existsSync(join(DIST, m)) ? gz(readFileSync(join(DIST, m))) : 0), 0);

  let cssBytes = 0;
  for (const link of querySelectorAll(doc, 'link[rel="stylesheet"]')) {
    const href = attr(link, 'href');
    if (/^https?:\/\//.test(href)) {
      fail(where, `third-party stylesheet ${href}`);
      continue;
    }
    const file = distFileFor(new URL(href, `${SITE_URL}${where}`).pathname);
    if (file) cssBytes += gz(readFileSync(file));
    else fail(where, `stylesheet ${href} is missing`);
  }
  for (const style of querySelectorAll(doc, 'style')) cssBytes += gz(Buffer.from(textOf(style)));

  const fontPreloads = querySelectorAll(doc, 'link[rel="preload"][as="font"]');
  let fontBytes = 0;
  for (const link of fontPreloads) {
    const href = attr(link, 'href');
    if (/^https?:\/\//.test(href)) {
      fail(where, `third-party font ${href}`);
      continue;
    }
    const file = distFileFor(new URL(href, `${SITE_URL}${where}`).pathname);
    if (file) fontBytes += statSync(file).size;
    else fail(where, `preloaded font ${href} is missing`);
  }

  // Eager images: anything without loading="lazy" is fetched with the page.
  let eagerImageBytes = 0;
  for (const img of querySelectorAll(doc, 'img')) {
    const src = attr(img, 'src') ?? '';
    if (/^https?:\/\//.test(src)) fail(where, `third-party image ${src}`);
    if (!attr(img, 'width') || !attr(img, 'height')) fail(where, `image without width and height: ${src}`);
    if (attr(img, 'loading') === 'lazy' || !src || src.startsWith('data:')) continue;
    const file = distFileFor(new URL(src, `${SITE_URL}${where}`).pathname);
    if (file) eagerImageBytes += statSync(file).size;
  }

  const htmlBytes = gz(Buffer.from(html));
  const isHome = page.id === 'home';
  const jsBudget = isHome ? BUDGET.jsHome : BUDGET.jsOther;
  if (jsBytes > jsBudget) fail(where, `first-load JavaScript ${fmt(jsBytes)} is over the ${fmt(jsBudget)} budget`);
  if (lazyBytes > BUDGET.lazyEffects) fail(where, `lazy effects ${fmt(lazyBytes)} are over the ${fmt(BUDGET.lazyEffects)} budget`);
  if (cssBytes > BUDGET.css) fail(where, `CSS ${fmt(cssBytes)} is over the ${fmt(BUDGET.css)} budget`);
  if (fontPreloads.length > BUDGET.fontPreloads) fail(where, `${fontPreloads.length} font preloads (max ${BUDGET.fontPreloads})`);
  if (fontBytes > BUDGET.fontPreloadBytes) fail(where, `preloaded fonts ${fmt(fontBytes)} are over ${fmt(BUDGET.fontPreloadBytes)}`);
  const firstLoad = htmlBytes + jsBytes + cssBytes + fontBytes + eagerImageBytes;
  if (isHome && firstLoad > BUDGET.homeFirstLoad) {
    fail(where, `first-load weight ${fmt(firstLoad)} is over the ${fmt(BUDGET.homeFirstLoad)} budget`);
  }
  budgetRows.push({ page: where, html: htmlBytes, js: jsBytes, lazy: lazyBytes, css: cssBytes, fonts: fontBytes, preloads: fontPreloads.length, images: eagerImageBytes, total: firstLoad });
}

// ---------------------------------------------------------------------------------------------------------
// 3. Sitemap and robots.txt.

const sitemapIndex = join(DIST, 'sitemap-index.xml');
if (!existsSync(sitemapIndex)) {
  fail('/sitemap-index.xml', 'missing');
} else {
  const sitemapUrls = new Set();
  for (const m of readFileSync(sitemapIndex, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const file = join(DIST, new URL(m[1]).pathname);
    if (!existsSync(file)) {
      fail('/sitemap-index.xml', `lists ${m[1]}, which isn't built`);
      continue;
    }
    for (const u of readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(u[1]);
  }
  const wanted = new Set(pages.map((p) => new URL(p.path, SITE_URL).href));
  for (const u of wanted) if (!sitemapUrls.has(u)) fail('sitemap', `missing ${u}`);
  for (const u of sitemapUrls) if (!wanted.has(u)) fail('sitemap', `lists ${u}, which isn't a route`);
}

const robotsFile = join(DIST, 'robots.txt');
if (!existsSync(robotsFile)) {
  fail('/robots.txt', 'missing');
} else {
  const robots = readFileSync(robotsFile, 'utf8');
  if (!/^User-agent:\s*\*\s*$/im.test(robots)) fail('/robots.txt', 'no "User-agent: *" group');
  if (/^Disallow:\s*\/\s*$/im.test(robots)) fail('/robots.txt', 'disallows the whole site');
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap-index.xml`)) fail('/robots.txt', 'does not point at the sitemap');
}

// ---------------------------------------------------------------------------------------------------------
// Report.

const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);
console.log('Budgets (gzip; fonts and images as stored)');
console.log(`${pad('page', 46)}${rpad('html', 9)}${rpad('js', 9)}${rpad('lazy', 9)}${rpad('css', 9)}${rpad('fonts', 9)}${rpad('img', 9)}${rpad('total', 10)}`);
for (const r of budgetRows) {
  console.log(
    `${pad(r.page, 46)}${rpad(fmt(r.html), 9)}${rpad(fmt(r.js), 9)}${rpad(fmt(r.lazy), 9)}${rpad(fmt(r.css), 9)}${rpad(`${fmt(r.fonts)}`, 9)}${rpad(fmt(r.images), 9)}${rpad(fmt(r.total), 10)}`,
  );
}
if (PENDING_ROUTE_IDS.size) console.log(`\nNot built yet (later milestone): ${[...PENDING_ROUTE_IDS].join(', ')}`);

if (errors.length) {
  console.error(`\ncheck-site: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`\ncheck-site: all checks passed (${htmlTargets.length} pages)`);
