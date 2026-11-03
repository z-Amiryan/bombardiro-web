// All interface and core-page text. The English file defines the shape; TypeScript rejects a Russian or
// Armenian file that is missing a key, and scripts/check-copy.mjs checks the rest.
import en from '../../content/copy/en.json' with { type: 'json' };
import hy from '../../content/copy/hy.json' with { type: 'json' };
import ru from '../../content/copy/ru.json' with { type: 'json' };
import type { Lang } from './routes';

export type Copy = typeof en;

const COPY: Record<Lang, Copy> = { en, ru, hy };

export function copyFor(lang: Lang): Copy {
  return COPY[lang];
}
