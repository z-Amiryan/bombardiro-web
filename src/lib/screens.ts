// Real captures of the app (assets/screenshots/), never invented UI. Each site language shows the captures
// set in SCREENSHOT_LANG, with alt text from that language's copy.
import type { ImageMetadata } from 'astro';
import { SCREENSHOT_LANG } from '../config/site';
import { copyFor } from './copy';
import type { Lang } from './routes';

const files = import.meta.glob<{ default: ImageMetadata }>('../../assets/screenshots/*/iphone/*.png', { eager: true });

export const SCREENS = {
  liveCard: '01-live-card',
  liveLate: '02-live-late',
  categories: '03-categories',
  teams: '04-teams',
  scoreboard: '05-scoreboard',
  wordEditor: '06-word-editor',
  settings: '07-settings',
  final: '08-final',
  languages: '09-languages',
} as const;

export type ScreenId = keyof typeof SCREENS;

export function screen(lang: Lang, id: ScreenId): { src: ImageMetadata; alt: string } {
  const key = `../../assets/screenshots/${SCREENSHOT_LANG[lang]}/iphone/${SCREENS[id]}.png`;
  const file = files[key];
  if (!file) throw new Error(`Missing screenshot ${key}`);
  return { src: file.default, alt: copyFor(lang).screens[id] };
}
