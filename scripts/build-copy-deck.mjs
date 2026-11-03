#!/usr/bin/env node
// Turns content/copy/{en,ru,hy}.json into one readable Markdown file for Claude Design and proofreading.
// Usage: node scripts/build-copy-deck.mjs [output path]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] ?? join(root, 'design/inputs/copy-deck.md'));
const LANGS = [
  ['en', 'English'],
  ['ru', 'Russian'],
  ['hy', 'Armenian'],
];
const copy = Object.fromEntries(
  LANGS.map(([l]) => [l, JSON.parse(readFileSync(join(root, 'content/copy', `${l}.json`), 'utf8'))]),
);

function lines(value, path = '') {
  if (typeof value === 'string') return [`- **${path}:** ${value}`];
  if (Array.isArray(value)) return value.flatMap((v, i) => lines(v, `${path} ${i + 1}`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => lines(v, path ? `${path} ${k}` : k));
  }
  return [];
}

const SHARED = { Navigation: 'nav', 'Calls to action': 'cta', Footer: 'footer', 'Page not found': 'notFound' };
const PAGES = {
  home: 'Home',
  howToPlay: 'How to play',
  words: 'Words',
  guides: 'Guides hub',
  support: 'Support',
  about: 'About',
  privacy: 'Privacy',
};

const doc = [
  '# Bombardiro website copy',
  '',
  'All text for the core pages, in English, Russian and Armenian. The labels and their order are only a way of',
  'organising the text. They are not a layout. Seven longer guides will be written during the build.',
  '',
];

for (const [title, id] of Object.entries(PAGES).map(([id, title]) => [title, id])) {
  doc.push(`## ${title}`, '');
  for (const [l, name] of LANGS) {
    doc.push(`### ${name}`, '', ...lines(copy[l].pages[id]), '');
  }
}

doc.push('## Shared text', '');
for (const [title, key] of Object.entries(SHARED)) {
  doc.push(`### ${title}`, '');
  for (const [l, name] of LANGS) doc.push(`**${name}**`, '', ...lines(copy[l][key]), '');
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, doc.join('\n'));
console.log(`Wrote ${out}`);
