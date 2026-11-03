#!/usr/bin/env node
// Checks content/copy/{en,ru,hy}.json: same structure in all three languages, meta lengths, banned
// claims and language-specific typography. Exits 1 on any failure, so CI can block a bad change.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['en', 'ru', 'hy'];
const copy = Object.fromEntries(
  LANGS.map((l) => [l, JSON.parse(readFileSync(join(root, 'content/copy', `${l}.json`), 'utf8'))]),
);

const errors = [];
const fail = (msg) => errors.push(msg);

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, shape(value[k])]));
  }
  return typeof value;
}

function strings(value, path = '') {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

const reference = JSON.stringify(shape(copy.en));
for (const l of LANGS) {
  if (JSON.stringify(shape(copy[l])) !== reference) fail(`${l}: structure differs from en`);
}

const BANNED_EVERYWHERE = [
  /\bfifa\b/i, /\buefa\b/i, /world cup 2026/i, /чм[- ]?2026/i, /crocodilo/i, /brainrot/i,
  /heads up/i, /\btaboo\b/i, /catchphrase/i, /codenames/i, /#1\b/, /\bultimate\b/i,
  /\bbest\b(?!-known)/i, /\bofficial\b/i, /\bswipe/i, /team colou?rs/i, /online multiplayer/i,
  /thousands of words/i, /10,000\+/, /for kids/i, /ad-free/i, /add your own words/i, /custom decks/i,
  /fix any call/i, /edit any round/i, /для детей/i, /официальн/i, /тысячи слов/i,
  /պաշտոնական/, /երեխաների համար/,
];
const GENDERED_RU = /(?<![а-яё])(нашёл|нашла|сделал|сделала|выбрал|выбрала|готов|готова|уверен|уверена)(?![а-яё])/i;
const ARM = 'Ա-և';

for (const l of LANGS) {
  const all = strings(copy[l]);
  for (const [path, text] of all) {
    if (path === 'footer.apple') continue;
    for (const re of BANNED_EVERYWHERE) if (re.test(text)) fail(`${l} ${path}: banned term ${re}`);
    if (l !== 'hy' && /\s{2,}/.test(text)) fail(`${l} ${path}: double space`);
    if (l === 'ru') {
      if (text.includes('"')) fail(`ru ${path}: use «ёлочки», not straight quotes`);
      if (/\s-\s/.test(text)) fail(`ru ${path}: use an em dash with spaces, not a hyphen`);
      if (GENDERED_RU.test(text)) fail(`ru ${path}: gendered verb or adjective`);
      if (/instagram/i.test(text)) fail(`ru ${path}: Instagram is not mentioned on Russian pages`);
    }
    if (l === 'hy') {
      if (new RegExp(`[${ARM}]:`).test(text)) fail(`hy ${path}: use ։ not an ASCII colon`);
      if (new RegExp(`[${ARM}]\\?`).test(text)) fail(`hy ${path}: use ՞ on the stressed vowel, not ?`);
      if (new RegExp(`[${ARM}]\\.(\\s|$)`).test(text.replaceAll('էլ. ', ''))) {
        fail(`hy ${path}: use ։ or ՝, not a Latin full stop`);
      }
    }
  }

  const seen = new Map();
  for (const [id, page] of Object.entries(copy[l].pages)) {
    const { title, description } = page.meta;
    if ([...title].length > 60) fail(`${l} ${id}: title is ${[...title].length} characters (max 60)`);
    const d = [...description].length;
    if (d > 160 || d < 70) fail(`${l} ${id}: description is ${d} characters (70–160)`);
    for (const field of [title, description]) {
      if (seen.has(field)) fail(`${l} ${id}: duplicate meta text, also on ${seen.get(field)}`);
      seen.set(field, id);
    }
    if (!/bombardiro|alias|алиас|ալիաս/i.test(title)) fail(`${l} ${id}: title names neither brand nor game`);
  }

  if (!copy[l].pages.privacy.updated.includes('{date}')) fail(`${l}: privacy.updated needs {date}`);
}

if (errors.length) {
  console.error(`check-copy: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
const count = LANGS.map((l) => `${l} ${strings(copy[l]).length}`).join(', ');
console.log(`check-copy: all checks passed (${count} strings)`);
