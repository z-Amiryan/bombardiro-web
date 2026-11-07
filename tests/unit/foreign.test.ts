import { describe, expect, it } from 'vitest';
import { foreignRuns } from '../../src/lib/foreign';

describe('foreignRuns', () => {
  it('marks Cyrillic on an English page', () => {
    expect(foreignRuns('The name plays on «бомбардир», the word', 'en')).toEqual([
      { text: 'The name plays on «' },
      { text: 'бомбардир', lang: 'ru' },
      { text: '», the word' },
    ]);
  });

  it('marks Armenian on a Russian page and leaves Russian alone', () => {
    expect(foreignRuns('Язык: Հայերեն', 'ru')).toEqual([{ text: 'Язык: ' }, { text: 'Հայերեն', lang: 'hy' }]);
  });

  it('keeps a multi-word run together', () => {
    expect(foreignRuns('say «футбольный алиас» here', 'en')[1]).toEqual({ text: 'футбольный алиас', lang: 'ru' });
  });

  it('returns the text unchanged when nothing is foreign', () => {
    expect(foreignRuns('Только русский текст', 'ru')).toEqual([{ text: 'Только русский текст' }]);
  });
});
