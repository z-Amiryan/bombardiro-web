#!/usr/bin/env node
// Renders the Open Graph cards from design/export/OG Images.dc.html, one per language, at 1200 × 630 into
// public/og/{lang}.jpg. Text comes from content/copy/, fonts from the same @fontsource-variable files the
// site serves. Run it when the home headline, eyebrow or availability line changes:
//     npm run build:og
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/site.mjs';

const fonts = join(ROOT, 'node_modules/@fontsource-variable');
const dataUrl = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`;
const face = (family, file, style = 'normal') =>
  `@font-face{font-family:'${family}';font-style:${style};font-weight:100 900;src:url(${dataUrl(join(fonts, file), 'font/woff2')}) format('woff2')}`;

const FONT_CSS = [
  face('Archivo', 'archivo/files/archivo-latin-wght-italic.woff2', 'italic'),
  face('Space Grotesk', 'space-grotesk/files/space-grotesk-latin-wght-normal.woff2'),
  face('Noto Sans', 'noto-sans/files/noto-sans-cyrillic-wght-normal.woff2'),
  face('Noto Sans', 'noto-sans/files/noto-sans-latin-wght-normal.woff2'),
  face('Noto Sans', 'noto-sans/files/noto-sans-cyrillic-wght-italic.woff2', 'italic'),
  face('Noto Sans', 'noto-sans/files/noto-sans-latin-wght-italic.woff2', 'italic'),
  face('Noto Sans Armenian', 'noto-sans-armenian/files/noto-sans-armenian-armenian-wght-normal.woff2'),
  face('Noto Sans Armenian', 'noto-sans-armenian/files/noto-sans-armenian-latin-wght-normal.woff2'),
].join('');

const TYPE = {
  en: { fd: "'Archivo'", fds: 'italic', fu: "'Space Grotesk'", size: 64 },
  ru: { fd: "'Noto Sans'", fds: 'italic', fu: "'Noto Sans'", size: 60 },
  hy: { fd: "'Noto Sans Armenian'", fds: 'normal', fu: "'Noto Sans Armenian'", size: 48 },
};

const outlines = JSON.parse(readFileSync(join(ROOT, 'src/assets/generated/outlines.json'), 'utf8'));
const mark = outlines.wordmark;
const wordmark = `<svg viewBox="${mark.viewBox}" height="34" style="height:${(34 * mark.heightEm).toFixed(1)}px;width:auto;display:block"><path fill="#EDF3E6" d="${mark.parts[0].d}"/><path fill="#BFF747" d="${mark.parts[1].d}"/></svg>`;
const icon = dataUrl(join(ROOT, 'assets/brand/icon.png'), 'image/png');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function card(lang) {
  const copy = JSON.parse(readFileSync(join(ROOT, 'content/copy', `${lang}.json`), 'utf8'));
  const h1 = copy.pages.home.h1;
  const parts = h1.match(/[^.!?։]+[.!?։]+/g) ?? [h1];
  const [a = '', b = '', ...rest] = parts.map((p) => p.trim());
  const c = rest.join(' ');
  const t = TYPE[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${FONT_CSS}
  html,body{margin:0;background:#101418}
  .og{width:1200px;height:630px;position:relative;overflow:hidden;background:#101418;color:#EDF3E6}
  .glow{position:absolute;inset:0;background:radial-gradient(80% 90% at 70% 0%,#1D262C 0%,#101418 60%)}
  .cone{position:absolute;left:640px;top:-80px;width:620px;height:900px;transform:rotate(14deg);transform-origin:50% 0;background:linear-gradient(180deg,rgba(237,243,230,.14) 0%,rgba(237,243,230,.04) 50%,rgba(237,243,230,0) 82%);clip-path:polygon(44% 0,56% 0,100% 100%,0 100%)}
  .ring{position:absolute;left:640px;top:100px;width:520px;height:520px;border-radius:50%;border:1.5px solid rgba(237,243,230,.09);box-sizing:border-box}
  .brand{position:absolute;left:60px;top:56px;display:flex;align-items:center;gap:14px}
  .brand img{width:56px;height:56px;border-radius:22%}
  .clock{position:absolute;right:60px;top:150px;font:italic 900 210px/.8 'Archivo';letter-spacing:-.045em;color:transparent;-webkit-text-stroke:2px rgba(237,243,230,.55)}
  .bar{position:absolute;left:60px;right:60px;top:350px;height:8px;border-radius:4px;background:rgba(237,243,230,.12)}
  .bar i{display:block;width:62%;height:8px;border-radius:4px;background:#BFF747}
  .foot{position:absolute;left:60px;right:60px;bottom:56px;display:flex;align-items:flex-end;justify-content:space-between;gap:40px}
  .h{font-family:${t.fd};font-style:${t.fds};font-weight:900;font-size:${t.size}px;line-height:.95;letter-spacing:-.015em;text-transform:uppercase}
  .h span{display:block}.h span:last-child{color:#BFF747}
  .side{flex:none;text-align:right;font-family:${t.fu};font-weight:700;font-size:20px;line-height:1.35;color:#C5CEC0;max-width:380px}
  .side span{display:block;font-weight:500;color:#9AA59A}
  </style></head><body><div class="og">
  <div class="glow"></div><div class="cone"></div><div class="ring"></div>
  <div class="brand"><img src="${icon}" alt="" width="56" height="56">${wordmark}</div>
  <div class="clock">01:00</div>
  <div class="bar"><i></i></div>
  <div class="foot"><div class="h"><span>${esc(a)}</span><span>${esc(b)}</span><span>${esc(c)}</span></div>
  <div class="side">${esc(copy.pages.home.eyebrow)}<span>${esc(copy.cta.availability).replace(/ (\S+)$/, '\u00a0$1')}</span></div></div>
  </div></body></html>`;
}

const out = join(ROOT, 'public/og');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const lang of ['en', 'ru', 'hy']) {
  await page.setContent(card(lang), { waitUntil: 'load' });
  await page.evaluate(() => globalThis.document.fonts.ready);
  const file = join(out, `${lang}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`public/og/${lang}.jpg: ${(statSync(file).size / 1024).toFixed(0)} KB`);
}
await browser.close();
