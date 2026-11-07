import { describe, expect, it } from 'vitest';
import { findBanned } from '../../scripts/lib/banned.mjs';
import { LANGS } from '../../src/lib/routes';
import { CATEGORY_ORDER, LEVELS, WORDS_PAGE_COUNT, word, wordsPageSelection } from '../../src/lib/words';

describe('the Words page selection (SPEC §5)', () => {
  const selection = wordsPageSelection();

  it('covers the six categories in order, with 24 Easy and 12 Hard words each', () => {
    expect(selection.map((c) => c.id)).toEqual(CATEGORY_ORDER);
    for (const c of selection) {
      expect(c.indices.easy).toHaveLength(WORDS_PAGE_COUNT.easy);
      expect(c.indices.hard).toHaveLength(WORDS_PAGE_COUNT.hard);
    }
  });

  it('takes words in pack order', () => {
    for (const c of selection) for (const level of LEVELS) expect([...c.indices[level]].sort((a, b) => a - b)).toEqual(c.indices[level]);
  });

  it('shows no word twice in any language', () => {
    for (const lang of LANGS) {
      const words = selection.flatMap((c) => LEVELS.flatMap((level) => c.indices[level].map((i) => word(lang, c.id, level, i).toLocaleLowerCase(lang))));
      expect(new Set(words).size).toBe(words.length);
    }
  });

  it('leaves out words the site never says, such as FIFA and UEFA', () => {
    for (const lang of LANGS) {
      for (const c of selection) for (const level of LEVELS) for (const i of c.indices[level]) expect(findBanned(word(lang, c.id, level, i))).toBeNull();
    }
  });

  it('skips a word already used by an earlier category, instead of cutting the list short', () => {
    // The World Cup's first Easy words are players already listed under Players.
    const worldcup = selection.find((c) => c.id === 'worldcup');
    expect(worldcup?.indices.easy[0]).toBeGreaterThan(0);
  });
});
