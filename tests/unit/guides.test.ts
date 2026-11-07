// The guides' YAML (src/content/guides/): the rules in handoff/guide-briefs.md that a test can check, and the
// glossary's terms against the game's packs.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { findBanned } from '../../scripts/lib/banned.mjs';
import { GUIDE_ROUTE_IDS, LANGS, routeLangs } from '../../src/lib/routes';
import { word, type Level } from '../../src/lib/words';

const ROOT = join(import.meta.dirname, '..', '..', 'src/content/guides');

interface Term {
  id: string;
  level: Level;
  index: number;
  ru: string;
  en: string;
  hy: string;
  def: string;
}
interface GuideFile {
  routeId: string;
  lang: (typeof LANGS)[number];
  title: string;
  short: string;
  sections: Array<{ id: string; app?: boolean; terms?: Term[] }>;
}

const guides = LANGS.flatMap((lang) =>
  readdirSync(join(ROOT, lang))
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => ({ file: `${lang}/${f}`, raw: readFileSync(join(ROOT, lang, f), 'utf8'), data: parse(readFileSync(join(ROOT, lang, f), 'utf8')) as GuideFile })),
);

/** As the glossary shows a pack word: lower case, except acronyms. */
const shown = (lang: (typeof LANGS)[number], level: Level, index: number) => {
  const w = word(lang, 'tactics', level, index);
  return /^(VAR|ВАР|ՎԱՐ)$/u.test(w) ? w : w.toLocaleLowerCase(lang);
};

describe('guides', () => {
  it('cover every guide route in handoff/routes.json, once per language', () => {
    const expected = GUIDE_ROUTE_IDS.flatMap((id) => routeLangs(id).map((lang) => `${id}:${lang}`)).sort();
    expect(guides.map((g) => `${g.data.routeId}:${g.data.lang}`).sort()).toEqual(expected);
  });

  for (const g of guides) {
    it(`${g.file} says nothing on the banned list`, () => {
      expect(findBanned(g.raw)).toBeNull();
    });

    it(`${g.file} answers in the first 60 words and shows the Bombardiro card once`, () => {
      expect(g.data.short.split(/\s+/).length).toBeLessThanOrEqual(60);
      expect(g.data.sections.filter((s) => s.app)).toHaveLength(1);
    });
  }

  it('glossary terms match the Tactics & Trophies pack at their index, in all three languages', () => {
    const glossary = guides.find((g) => g.data.routeId === 'guideGlossary');
    const terms = glossary?.data.sections.flatMap((s) => s.terms ?? []) ?? [];
    expect(terms.length).toBeGreaterThanOrEqual(60);
    expect(terms.length).toBeLessThanOrEqual(80);
    expect(new Set(terms.map((t) => t.id)).size).toBe(terms.length);
    for (const t of terms) {
      expect({ id: t.id, ru: t.ru, en: t.en, hy: t.hy }).toEqual({
        id: t.id,
        ru: shown('ru', t.level, t.index),
        en: shown('en', t.level, t.index),
        hy: shown('hy', t.level, t.index),
      });
    }
  });
});
