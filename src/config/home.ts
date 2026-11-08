// What the Home design shows, as data: the clock times of the four turn beats and the words on the wall.
import type { Lang } from '../lib/routes';
import type { CategoryId } from '../lib/words';
import { SCREENSHOT_LANG } from './site';

/**
 * The clock reading at each beat. The third beat pairs with the "late" capture, so it shows the time on that
 * screen: 00:07 in the English capture, 00:08 in the Russian one.
 */
const LATE_SECONDS = { en: 7, ru: 8 } as const;

export function turnTimes(lang: Lang): [number, number, number, number] {
  return [60, 40, LATE_SECONDS[SCREENSHOT_LANG[lang]], 0];
}

/** Seconds as the app's clock shows them: 01:00, 00:40, 00:07. */
export function clockText(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface WallRow {
  category: CategoryId;
  /** Indices into the category's Easy list. */
  indices: readonly number[];
  /** Seconds per loop of the drift: one of the speeds WordBand.astro has a rule for. */
  seconds: 52 | 58 | 64 | 70;
}

/**
 * The Home word wall: real Easy words from the game's packs, by index, so every language shows the same words.
 * Rows above the headline, then below it.
 */
export const WALL_ROWS: Record<'above' | 'below', readonly WallRow[]> = {
  above: [
    { category: 'players', indices: [0, 3, 2, 6, 22, 7, 23, 20], seconds: 52 },
    { category: 'clubs', indices: [0, 5, 9, 12, 6, 13, 7, 1], seconds: 64 },
  ],
  below: [
    { category: 'stadiums', indices: [0, 2, 4, 3, 1, 5, 7, 6], seconds: 70 },
    { category: 'legends', indices: [0, 1, 2, 4, 5, 6, 7, 3], seconds: 58 },
  ],
};
