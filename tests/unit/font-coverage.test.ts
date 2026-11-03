// Every character a language's pages say is drawn by that language's own fonts (handoff/SPEC.md §8): no
// system fallback for any letter, digit or punctuation mark in content/copy/ (and the guides, once written).
import { create } from 'fontkitten';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FONT_FAMILIES, LANG_FONTS, type FontStyle } from '../../src/config/fonts';
import { LANGS, type Lang } from '../../src/lib/routes';

const ROOT = join(import.meta.dirname, '..', '..');
const require = createRequire(join(ROOT, 'package.json'));

function parseRanges(range: string): Array<[number, number]> {
  return range.split(',').map((part) => {
    const [a, b] = part.trim().replace(/^U\+/i, '').split('-');
    const start = parseInt(a!, 16);
    return [start, b ? parseInt(b, 16) : start];
  });
}

interface LoadedVariant {
  family: string;
  style: FontStyle;
  ranges: Array<[number, number]>;
  chars: Set<number>;
}

const loaded = new Map<string, LoadedVariant[]>();
for (const family of FONT_FAMILIES) {
  loaded.set(
    family.cssVariable,
    family.variants.map((v) => {
      const file = v.src.startsWith('@') ? require.resolve(v.src) : join(ROOT, v.src);
      const font = create(readFileSync(file));
      if (font.isCollection) throw new Error(`${file} is a font collection, expected one font`);
      return { family: family.name, style: v.style, ranges: parseRanges(v.unicodeRange), chars: new Set(font.characterSet) };
    }),
  );
}

function covered(cp: number, families: readonly string[], style?: FontStyle): boolean {
  return families.some((f) =>
    (loaded.get(f) ?? []).some(
      (v) => (!style || v.style === style) && v.chars.has(cp) && v.ranges.some(([a, b]) => cp >= a && cp <= b),
    ),
  );
}

function strings(value: unknown, path = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

/** Everything a language's pages say: its copy file, plus its guides once they exist. */
function siteText(lang: Lang): Array<[string, string]> {
  const copy = JSON.parse(readFileSync(join(ROOT, 'content/copy', `${lang}.json`), 'utf8'));
  const out = strings(copy);
  const guides = join(ROOT, 'src/content/guides', lang);
  if (existsSync(guides)) {
    for (const file of readdirSync(guides).filter((f) => f.endsWith('.md'))) {
      out.push([`guides/${lang}/${file}`, readFileSync(join(guides, file), 'utf8')]);
    }
  }
  return out;
}

// Copy keys set in the display face (titles, headlines, category names), which must be drawn by it too.
const DISPLAY_KEY = /(^|\.)(h1|title|eyebrow|name|value|getApp)$|\.steps\[\d+\]\.title$|^nav\.(home|howToPlay|words|guides|support|about)$/;
const REQUIRED: Record<Lang, string> = { en: '«»—–', ru: '«»—–№', hy: '«»—–։՝՞' };

describe('font coverage', () => {
  for (const lang of LANGS) {
    const fonts = LANG_FONTS[lang];
    const all = fonts.families as readonly string[];

    it(`draws every character of the ${lang} copy with ${lang} fonts`, () => {
      const missing = new Map<string, string>();
      for (const [where, text] of siteText(lang)) {
        for (const ch of text) {
          if (/\s/.test(ch)) continue;
          if (!covered(ch.codePointAt(0)!, all)) missing.set(ch, where);
        }
      }
      expect([...missing].map(([ch, where]) => `${ch} (U+${ch.codePointAt(0)!.toString(16).toUpperCase()}) in ${where}`)).toEqual([]);
    });

    it(`draws the ${lang} display text in the display face`, () => {
      const missing: string[] = [];
      for (const [where, text] of siteText(lang)) {
        if (!DISPLAY_KEY.test(where) || where.includes('meta.') || where.startsWith('languageNames')) continue;
        for (const ch of text) {
          if (/\s/.test(ch)) continue;
          if (!covered(ch.codePointAt(0)!, [fonts.display.family], fonts.display.style)) missing.push(`${ch} in ${where}`);
        }
      }
      expect(missing).toEqual([]);
    });

    it(`has the ${lang} punctuation the spec names`, () => {
      const missing = [...REQUIRED[lang]].filter(
        (ch) =>
          !covered(ch.codePointAt(0)!, [fonts.body.family], fonts.body.style) ||
          !covered(ch.codePointAt(0)!, [fonts.display.family], fonts.display.style),
      );
      expect(missing).toEqual([]);
    });
  }
});
