// Shared facts about the site for scripts/ and tests/: where things live and which pages must exist.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIST = join(ROOT, 'dist');

export const routes = JSON.parse(readFileSync(join(ROOT, 'handoff/routes.json'), 'utf8'));
export const SITE_URL = routes.site;
/** @type {Array<'en' | 'ru' | 'hy'>} */
export const LANGS = routes.locales;

/**
 * Route ids whose pages are built in a later milestone of handoff/SPEC.md §15. Every check that needs a page
 * skips these until then. Empty since milestone 5: every route in handoff/routes.json must be built.
 * @type {Set<string>}
 */
export const PENDING_ROUTE_IDS = new Set();

/**
 * Every page the build must contain: one entry per route id and language.
 * @returns {Array<{ id: string, lang: 'en' | 'ru' | 'hy', path: string, file: string }>}
 */
export function expectedPages() {
  const out = [];
  for (const [id, byLang] of Object.entries(routes.pages)) {
    if (PENDING_ROUTE_IDS.has(id)) continue;
    for (const lang of LANGS) {
      const path = byLang[lang];
      if (path) out.push({ id, lang, path, file: join(DIST, path, 'index.html') });
    }
  }
  return out;
}

/** A page's language versions, as listed in routes.json. */
export function alternatesOf(id) {
  return LANGS.filter((l) => routes.pages[id][l]).map((l) => ({ lang: l, path: routes.pages[id][l] }));
}
