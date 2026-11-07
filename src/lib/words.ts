// The game's word packs (content/words/), aligned by index across languages.
import en from '../../content/words/words.en.json' with { type: 'json' };
import hy from '../../content/words/words.hy.json' with { type: 'json' };
import ru from '../../content/words/words.ru.json' with { type: 'json' };
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
