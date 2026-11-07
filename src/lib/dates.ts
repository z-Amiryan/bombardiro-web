// Dates as each language writes them: "2 November 2026", «2 ноября 2026 г.», «2 նոյեմբերի, 2026 թ.».
import type { Lang } from './routes';

const LOCALES: Record<Lang, string> = { en: 'en-GB', ru: 'ru-RU', hy: 'hy-AM' };

/** Formats an ISO date (YYYY-MM-DD) in the page's language. */
export function formatDate(lang: Lang, iso: string): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}
