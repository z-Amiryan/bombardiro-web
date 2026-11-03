#!/usr/bin/env node
// Checks the production build in dist/: every route exists with the right language and one h1, titles and
// descriptions are unique and within limits, internal links, fragments and assets resolve, the sitemap
// matches handoff/routes.json, robots.txt is right, banned claims never reach a page (text or attributes),
// and every page is inside the budgets in handoff/SPEC.md §9. Exits 1 on any failure.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, posix, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ELEMENT_NODE, parse, TEXT_NODE, walkSync } from 'ultrahtml';
import { querySelector, querySelectorAll } from 'ultrahtml/selector';
import { findBanned } from './lib/banned.mjs';
import { alternatesOf, DIST, expectedPages, LANGS, PENDING_ROUTE_IDS, ROOT, routes, SITE_URL } from './lib/site.mjs';

const KB = 1024;
const BUDGET = {
  /** Home's first-load JavaScript, including the 2.4 KB of Vercel loaders (inline scripts, counted as such). */
  jsHome: 30 * KB,
  /** Every other page's first-load JavaScript. */
  jsOther: 8 * KB,
  /** Effects loaded after the page is interactive. */
  lazyEffects: 40 * KB,
  css: 25 * KB,
  fontPreloads: 2,
  fontPreloadBytes: 60 * KB,
  homeFirstLoad: 500 * KB,
};

const copy = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(join(ROOT, 'content/copy', `${l}.json`), 'utf8'))]));
const APP_STORE_ID = '6813968416';
const OG_LOCALE = { en: 'en_US', ru: 'ru_RU', hy: 'hy_AM' };
const THEME_COLOR = { night: '#101418', lime: '#BFF747', chalk: '#EEF2E9' };
// Text in another script must carry its own lang (SPEC §10). Latin is shared by all three languages.
const SCRIPT_LANG = [
  { re: /[\u0400-\u04FF]/, lang: 'ru' },
  { re: /[\u0530-\u058F\uFB13-\uFB17]/, lang: 'hy' },
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

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&');
}

function textOf(node) {
  let out = '';
  walkSync(node, (n) => {
    if (n.type === TEXT_NODE) out += n.value;
  });
  return decodeEntities(out).replace(/\s+/g, ' ').trim();
}

/** Text for the banned-claims scan: text nodes kept apart, as a reader sees them, without script or style. */
function scanTextOf(node) {
  const parts = [];
  walkSync(node, (n, parent) => {
    if (n.type === TEXT_NODE && !['script', 'style', 'template'].includes(parent?.name)) parts.push(n.value);
  });
  return decodeEntities(parts.join(' ')).replace(/\s+/g, ' ');
}

const attr = (node, name) => (node?.attributes?.[name] === undefined ? undefined : decodeEntities(String(node.attributes[name])));

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
}

/** Where a site path lives in dist/, or null if nothing is there. */
function distFileFor(pathname) {
  const clean = safeDecode(pathname);
  if (clean === null) return null;
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

/** Static imports and re-exports (first load) and dynamic imports (lazy) of a built module, recursively. */
function moduleGraph(entry, seen = new Set(), lazy = new Set()) {
  if (seen.has(entry)) return { seen, lazy };
  seen.add(entry);
  const file = join(DIST, entry);
  if (!existsSync(file)) return { seen, lazy };
  const code = readFileSync(file, 'utf8');
  const dir = posix.dirname(entry);
  const resolve = (spec) => (spec.startsWith('/') ? spec : posix.join(dir, spec));
  for (const m of code.matchAll(/\b(?:import|export)\s*(?:[\w$*{}\s,]+\s*from\s*)?["']([^"']+\.m?js)["']/g)) {
    moduleGraph(resolve(m[1]), seen, lazy);
  }
  for (const m of code.matchAll(/\bimport\(\s*["']([^"']+\.m?js)["']\s*\)/g)) lazy.add(resolve(m[1]));
  return { seen, lazy };
}

const bytesOf = (modules) =>
  [...modules].reduce((sum, m) => sum + (existsSync(join(DIST, m)) ? gz(readFileSync(join(DIST, m))) : 0), 0);

/** The URLs a srcset lists, without their descriptors. */
const srcsetUrls = (srcset) => (srcset ?? '').split(',').map((c) => c.trim().split(/\s+/)[0]).filter(Boolean);

function metaContent(doc, selector) {
  return attr(querySelector(doc, selector), 'content');
}

/** Canonical, hreflang, Open Graph, Twitter, theme-color, icons, App Store banner and JSON-LD (SPEC §6). */
function checkHead(doc, page, where) {
  const head = querySelector(doc, 'head');
  const canonical = querySelectorAll(head, 'link[rel="canonical"]');
  const url = new URL(page.path, SITE_URL).href;
  if (canonical.length !== 1) fail(where, `${canonical.length} canonical links, expected 1`);
  else if (attr(canonical[0], 'href') !== url) fail(where, `canonical ${attr(canonical[0], 'href')}, expected ${url}`);

  // hreflang: exactly the language versions in routes.json, plus x-default (English, or the only version).
  const hreflangs = querySelectorAll(head, 'link[rel="alternate"][hreflang]').map((l) => [attr(l, 'hreflang'), attr(l, 'href')]);
  const alts = alternatesOf(page.id);
  const expected = alts.map((a) => [a.lang, new URL(a.path, SITE_URL).href]);
  const xDefault = (alts.find((a) => a.lang === 'en') ?? alts[0]).path;
  expected.push(['x-default', new URL(xDefault, SITE_URL).href]);
  const key = (pairs) => pairs.map((p) => p.join(' ')).sort().join('\n');
  if (key(hreflangs) !== key(expected)) {
    fail(where, `hreflang links don't match routes.json:\n      got ${key(hreflangs).replace(/\n/g, ', ')}\n      want ${key(expected).replace(/\n/g, ', ')}`);
  }
  if (querySelectorAll(doc, 'body link[rel="alternate"][hreflang]').length) fail(where, 'hreflang links outside <head>');

  const og = (p) => metaContent(head, `meta[property="${p}"]`);
  for (const p of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:image', 'og:image:alt']) {
    if (!og(p)) fail(where, `missing ${p}`);
  }
  if (og('og:url') !== url) fail(where, `og:url ${og('og:url')}, expected ${url}`);
  if (og('og:locale') !== OG_LOCALE[page.lang]) fail(where, `og:locale ${og('og:locale')}, expected ${OG_LOCALE[page.lang]}`);
  const image = og('og:image') ?? '';
  if (!image.startsWith(`${SITE_URL}/`)) fail(where, `og:image must be an absolute ${SITE_URL} URL`);
  else if (!distFileFor(new URL(image).pathname)) fail(where, `og:image ${image} is not built`);
  if (og('og:image:width') !== '1200' || og('og:image:height') !== '630') fail(where, 'og:image must be 1200 × 630');
  if (metaContent(head, 'meta[name="twitter:card"]') !== 'summary_large_image') fail(where, 'twitter:card must be summary_large_image');

  const surface = attr(querySelector(doc, 'html'), 'data-surface');
  const theme = metaContent(head, 'meta[name="theme-color"]');
  if (!theme) fail(where, 'missing theme-color');
  else if (THEME_COLOR[surface] && theme.toUpperCase() !== THEME_COLOR[surface]) fail(where, `theme-color ${theme} doesn't match the ${surface} surface`);
  for (const sel of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) {
    const links = querySelectorAll(head, sel);
    if (!links.length) fail(where, `missing ${sel}`);
    for (const l of links) if (!distFileFor(attr(l, 'href'))) fail(where, `${sel} ${attr(l, 'href')} is not built`);
  }
  if (metaContent(head, 'meta[name="apple-itunes-app"]') !== `app-id=${APP_STORE_ID}`) fail(where, 'missing or wrong apple-itunes-app meta');

  checkJsonLd(doc, page, where);
}

function checkJsonLd(doc, page, where) {
  const blocks = querySelectorAll(doc, 'script[type="application/ld+json"]');
  if (!blocks.length) return fail(where, 'no JSON-LD');
  const nodes = [];
  for (const b of blocks) {
    const raw = b.children?.map((c) => c.value ?? '').join('') ?? '';
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      fail(where, `JSON-LD doesn't parse: ${e.message}`);
      continue;
    }
    if (/aggregateRating|"review"|FAQPage/.test(raw)) fail(where, 'JSON-LD claims a rating, review or FAQ (SPEC §6 forbids it)');
    nodes.push(...(data['@graph'] ?? [data]));
  }
  const types = (n) => [n['@type']].flat();
  const find = (t) => nodes.find((n) => types(n).includes(t));
  const org = find('Organization');
  if (!org) fail(where, 'JSON-LD has no Organization');
  else for (const k of ['name', 'url', 'logo', 'email', 'sameAs']) if (!org[k]) fail(where, `Organization has no ${k}`);
  if (org && page.lang === 'ru' && JSON.stringify(org.sameAs).includes('instagram')) fail(where, 'Instagram on a Russian page');
  if (!find('WebSite')) fail(where, 'JSON-LD has no WebSite');
  const appNode = nodes.find((n) => types(n).includes('VideoGame') && types(n).includes('MobileApplication'));
  if (page.id === 'home') {
    if (!appNode) fail(where, 'Home has no VideoGame + MobileApplication');
    else {
      if (appNode.operatingSystem !== 'iOS') fail(where, 'app operatingSystem must be "iOS"');
      if (appNode.applicationCategory !== 'GameApplication') fail(where, 'app applicationCategory must be "GameApplication"');
      if (appNode.offers?.price !== '0' || appNode.offers?.priceCurrency !== 'USD') fail(where, 'app offers must be price "0" in USD');
      if (JSON.stringify(appNode.inLanguage) !== JSON.stringify(LANGS)) fail(where, 'app inLanguage must be ["en","ru","hy"]');
    }
  }
  const crumbs = find('BreadcrumbList');
  if (page.id !== 'home' && !crumbs) fail(where, 'no BreadcrumbList');
  if (page.id === 'home' && crumbs) fail(where, 'Home should not have a BreadcrumbList');
  if (crumbs) {
    const items = crumbs.itemListElement ?? [];
    items.forEach((item, i) => {
      if (item.position !== i + 1) fail(where, 'breadcrumb positions must count from 1');
      if (!item.name || !distFileFor(new URL(item.item).pathname)) fail(where, `breadcrumb ${item.name} points at ${item.item}, which isn't built`);
    });
    if (items.at(-1)?.item !== new URL(page.path, SITE_URL).href) fail(where, 'the last breadcrumb must be the page itself');
  }
}

/** Text in another script carries that language's lang attribute (SPEC §10). */
function checkForeignText(doc, page, where) {
  const visit = (node, lang) => {
    if (node.type === ELEMENT_NODE) {
      if (node.name === 'script' || node.name === 'style' || node.name === 'head') return;
      const own = node.attributes?.lang;
      if (own !== undefined) lang = String(own);
      for (const c of node.children ?? []) visit(c, lang);
    } else if (node.type === TEXT_NODE) {
      for (const { re, lang: expected } of SCRIPT_LANG) {
        if (re.test(node.value) && lang !== expected) {
          fail(where, `"${node.value.trim().slice(0, 40)}" is ${expected} text inside lang="${lang}"`);
        }
      }
    }
  };
  visit(querySelector(doc, 'html') ?? doc, page.lang);
}

/** The independence line on every page; Apple's credit line exactly once (.claude/rules/legal.md). */
function checkFooter(page, where, bodyText) {
  if (page.id === 'notFound') return;
  const t = copy[page.lang].footer;
  if (!bodyText.includes(t.independent)) fail(where, 'footer.independent is missing');
  const count = bodyText.split(t.apple).length - 1;
  if (count !== 1) fail(where, `footer.apple appears ${count} times, expected once`);
  if (page.lang === 'ru' && /instagram/i.test(readFileSync(page.file, 'utf8'))) fail(where, 'Instagram on a Russian page');
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
// 2. Per page.

const titles = new Map();
const descriptions = new Map();
const budgetRows = [];

const htmlTargets = [
  ...pages.filter((p) => existsSync(p.file)),
  { id: 'notFound', lang: 'en', path: '/404.html', file: join(DIST, '404.html') },
];

for (const page of htmlTargets) {
  if (!existsSync(page.file)) continue;
  const html = readFileSync(page.file, 'utf8');
  const doc = parse(html);
  const where = page.path;
  const isNotFound = page.id === 'notFound';

  const htmlEl = querySelector(doc, 'html');
  if (attr(htmlEl, 'lang') !== page.lang) fail(where, `<html lang="${attr(htmlEl, 'lang')}">, expected "${page.lang}"`);

  const h1s = querySelectorAll(doc, 'h1');
  if (h1s.length !== 1) fail(where, `${h1s.length} h1 elements, expected exactly 1`);
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
    // The name alone autocompletes to an unrelated meme, so titles and descriptions always pair it with
    // football (.claude/rules/seo.md). The domain, bombardiro.app, is lowercase and not counted.
    for (const [kind, text] of [['title', title], ['description', description]]) {
      if (/\bBombardiro\b/.test(text) && !/football|футбол|ֆուտբոլ/i.test(text)) fail(where, `${kind} names Bombardiro without football (seo.md)`);
    }
  }

  // Banned claims, in visible text and in the attributes people and machines read.
  const bodyText = scanTextOf(querySelector(doc, 'body') ?? doc);
  const jsonLd = querySelectorAll(doc, 'script[type="application/ld+json"]').map((n) => decodeEntities(n.children?.map((c) => c.value ?? '').join('') ?? '')).join(' ');
  const attributeText = [
    ...querySelectorAll(doc, '[alt], [title], [aria-label]'),
    ...querySelectorAll(doc, 'meta[content]'),
  ]
    .map((n) => ['alt', 'title', 'aria-label', 'content'].map((k) => attr(n, k) ?? '').join(' '))
    .join(' ');
  const scanned = `${title} ${bodyText} ${attributeText} ${jsonLd}`.replace(/\s+/g, ' ');
  const banned = findBanned(scanned);
  if (banned) fail(where, `banned phrase "${banned}" (.claude/rules/copy.md)`);

  if (!isNotFound) checkHead(doc, page, where);
  checkForeignText(doc, page, where);
  checkFooter(page, where, textOf(querySelector(doc, 'body') ?? doc));

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
    if (!URL.canParse(href, SITE_URL)) {
      fail(where, `malformed link ${href}`);
      continue;
    }
    // Links out, including protocol-relative ones (//host/path), are not checked; a link back to this site must be
    // written as a path.
    if (/^(https?:)?\/\//.test(href)) {
      if (new URL(href, SITE_URL).origin === SITE_URL) fail(where, `internal link written as an absolute URL: ${href}`);
      continue;
    }
    // The 404 page is served at any address, so its links must not depend on where it is.
    if (isNotFound && !href.startsWith('/') && !href.startsWith('#')) fail(where, `relative link ${href} on the 404 page`);
    const url = new URL(href, `${SITE_URL}${where}`);
    if (href.startsWith('#') || url.pathname === where) {
      const id = safeDecode(url.hash.slice(1));
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
    const id = safeDecode(url.hash.slice(1));
    if (id && target.endsWith('.html') && !idsIn(target).has(id)) {
      fail(where, `link to ${url.pathname}#${id}, which has no such id`);
    }
  }

  // Assets: every internal image, source, video, poster and icon must exist.
  const assetUrls = [];
  for (const n of querySelectorAll(doc, 'img, source, video, audio, track')) {
    for (const key of ['src', 'poster']) if (attr(n, key)) assetUrls.push(attr(n, key));
    assetUrls.push(...srcsetUrls(attr(n, 'srcset')));
  }
  for (const n of [...querySelectorAll(doc, 'link[rel="icon"]'), ...querySelectorAll(doc, 'link[rel="apple-touch-icon"]')]) {
    assetUrls.push(attr(n, 'href'));
  }
  for (const u of assetUrls) {
    if (!u || u.startsWith('data:')) continue;
    if (/^(https?:)?\/\//.test(u)) {
      fail(where, `third-party asset ${u}`);
      continue;
    }
    if (isNotFound && !u.startsWith('/')) fail(where, `relative asset URL ${u} on the 404 page`);
    if (!distFileFor(new URL(u, `${SITE_URL}${where}`).pathname)) fail(where, `missing asset ${u}`);
  }

  // Budgets. First-load JS: module scripts, their static imports and re-exports, modulepreloads, Astro island
  // modules and inline scripts (which include the Vercel loaders once they're on the page).
  const firstLoadModules = new Set();
  const lazyModules = new Set();
  const addGraph = (url) => {
    if (!distFileFor(new URL(url, `${SITE_URL}${where}`).pathname)) fail(where, `missing script ${url}`);
    const { seen, lazy } = moduleGraph(new URL(url, `${SITE_URL}${where}`).pathname);
    seen.forEach((m) => firstLoadModules.add(m));
    lazy.forEach((m) => lazyModules.add(m));
  };
  let inlineJs = 0;
  for (const s of querySelectorAll(doc, 'script')) {
    const type = attr(s, 'type') ?? '';
    if (type === 'application/ld+json' || type === 'application/json') continue;
    const src = attr(s, 'src');
    if (src) {
      if (/^(https?:)?\/\//.test(src)) fail(where, `third-party script ${src}`);
      else addGraph(src);
    } else {
      inlineJs += gz(Buffer.from(s.children?.map((c) => c.value ?? '').join('') ?? ''));
    }
  }
  for (const link of querySelectorAll(doc, 'link[rel="modulepreload"]')) addGraph(attr(link, 'href'));
  for (const island of querySelectorAll(doc, 'astro-island')) {
    for (const key of ['component-url', 'renderer-url', 'before-hydration-url']) {
      if (attr(island, key)) addGraph(attr(island, key));
    }
  }
  const lazyOnly = new Set();
  for (const m of lazyModules) {
    const { seen } = moduleGraph(m);
    seen.forEach((x) => !firstLoadModules.has(x) && lazyOnly.add(x));
  }
  const jsBytes = bytesOf(firstLoadModules) + inlineJs;
  const lazyBytes = bytesOf(lazyOnly);

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

  // Eager images (no loading="lazy"), weighed by their largest candidate, plus video posters.
  const sizeOf = (u) => {
    const file = u && !u.startsWith('data:') ? distFileFor(new URL(u, `${SITE_URL}${where}`).pathname) : null;
    return file ? statSync(file).size : 0;
  };
  let eagerImageBytes = 0;
  for (const img of querySelectorAll(doc, 'img')) {
    if (!attr(img, 'width') || !attr(img, 'height')) fail(where, `image without width and height: ${attr(img, 'src')}`);
  }
  // One download per eager image: in a <picture>, the first <source> (browsers take the first type they
  // support), otherwise the <img>.
  const inPicture = new Set();
  for (const picture of querySelectorAll(doc, 'picture')) {
    const img = querySelector(picture, 'img');
    if (!img) continue;
    inPicture.add(img);
    if (attr(img, 'loading') === 'lazy') continue;
    const source = querySelector(picture, 'source');
    const candidates = source ? srcsetUrls(attr(source, 'srcset')) : [attr(img, 'src'), ...srcsetUrls(attr(img, 'srcset'))];
    eagerImageBytes += Math.max(0, ...candidates.map(sizeOf));
  }
  for (const img of querySelectorAll(doc, 'img')) {
    if (inPicture.has(img) || attr(img, 'loading') === 'lazy') continue;
    eagerImageBytes += Math.max(0, ...[attr(img, 'src'), ...srcsetUrls(attr(img, 'srcset'))].map(sizeOf));
  }
  for (const video of querySelectorAll(doc, 'video[poster]')) eagerImageBytes += sizeOf(attr(video, 'poster'));

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
  budgetRows.push({ page: where, html: htmlBytes, js: jsBytes, lazy: lazyBytes, css: cssBytes, fonts: fontBytes, images: eagerImageBytes, total: firstLoad });
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
console.log('Budgets per page: gzip for text, stored size for fonts and images.');
console.log('"total" is a lower bound (fonts that are used but not preloaded, and CSS images, are not in it);');
console.log("Lighthouse CI's total-byte-weight is the real first-load gate.\n");
console.log(`${pad('page', 46)}${rpad('html', 9)}${rpad('js', 9)}${rpad('lazy', 9)}${rpad('css', 9)}${rpad('fonts', 9)}${rpad('img', 9)}${rpad('total', 10)}`);
for (const r of budgetRows) {
  console.log(
    `${pad(r.page, 46)}${rpad(fmt(r.html), 9)}${rpad(fmt(r.js), 9)}${rpad(fmt(r.lazy), 9)}${rpad(fmt(r.css), 9)}${rpad(fmt(r.fonts), 9)}${rpad(fmt(r.images), 9)}${rpad(fmt(r.total), 10)}`,
  );
}
if (PENDING_ROUTE_IDS.size) console.log(`\nNot built yet (later milestone): ${[...PENDING_ROUTE_IDS].join(', ')}`);

if (errors.length) {
  console.error(`\ncheck-site: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`\ncheck-site: all checks passed (${htmlTargets.length} pages)`);
