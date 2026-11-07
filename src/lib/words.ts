// The game's word packs (content/words/), aligned by index across languages.
import en from '../../content/words/words.en.json' with { type: 'json' };
import hy from '../../content/words/words.hy.json' with { type: 'json' };
import ru from '../../content/words/words.ru.json' with { type: 'json' };
import { findBanned } from '../../scripts/lib/banned.mjs';
import type { Lang } from './routes';

export type Pack = typeof en;
export type CategoryId = keyof Pack['categories'];
export type Level = 'easy' | 'hard';

export const CATEGORY_ORDER: CategoryId[] = ['players', 'clubs', 'tactics', 'stadiums', 'legends', 'worldcup'];

const PACKS: Record<Lang, Pack> = { en, ru, hy };

export function pack(lang: Lang): Pack {
  return PACKS[lang];
}

export function word(lang: Lang, category: CategoryId, level: Level, index: number): string {
  const w = PACKS[lang].categories[category][level][index];
  if (w === undefined) throw new Error(`No ${lang} ${category} ${level} word at ${index}`);
  return w;
}

export const LEVELS: readonly Level[] = ['easy', 'hard'];

/** How many words of each level the Words page shows per category (handoff/SPEC.md §5). */
export const WORDS_PAGE_COUNT: Record<Level, number> = { easy: 24, hard: 12 };

export interface PageCategory {
  id: CategoryId;
  /** Indices into the category's lists, the same in every language. */
  indices: Record<Level, number[]>;
}

/**
 * The words on the Words page: for each category in order, the first 24 Easy and 12 Hard words in pack order,
 * skipping any index whose word, in any language, already appears earlier on the page, or names something the
 * site never says (scripts/lib/banned.mjs: FIFA, UEFA). Chosen by index so every language shows the same words.
 */
export function wordsPageSelection(langs: readonly Lang[] = ['en', 'ru', 'hy']): PageCategory[] {
  const used = new Map(langs.map((lang) => [lang, new Set<string>()]));
  return CATEGORY_ORDER.map((id) => {
    const indices = { easy: [] as number[], hard: [] as number[] };
    for (const level of LEVELS) {
      const size = Math.min(...langs.map((lang) => PACKS[lang].categories[id][level].length));
      for (let i = 0; i < size && indices[level].length < WORDS_PAGE_COUNT[level]; i++) {
        const words = langs.map((lang) => [lang, word(lang, id, level, i).toLocaleLowerCase(lang)] as const);
        if (words.some(([lang, w]) => used.get(lang)?.has(w) || findBanned(w))) continue;
        for (const [lang, w] of words) used.get(lang)?.add(w);
        indices[level].push(i);
      }
      if (indices[level].length < WORDS_PAGE_COUNT[level]) throw new Error(`Not enough ${level} words in ${id}`);
    }
    return { id, indices };
  });
}

/** How many words a category holds in one language, both levels together. */
export function categorySize(lang: Lang, id: CategoryId): number {
  const c = PACKS[lang].categories[id];
  return c.easy.length + c.hard.length;
}
