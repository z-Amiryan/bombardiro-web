// The guides in one language, in the order handoff/routes.json lists them, with their reading time, and the
// small link syntax their text uses: [words](routeId) or [words](routeId#fragment).
import { getCollection, type CollectionEntry } from 'astro:content';
import { GUIDE_ROUTE_IDS, ROUTE_IDS, routePath, type GuideRouteId, type Lang, type RouteId } from './routes';

export type Guide = CollectionEntry<'guides'>;
export type GuideSection = Guide['data']['sections'][number];

/** Reading speed for the "min read" label, in words per minute. */
const WORDS_PER_MINUTE = 200;

/** Every piece of text a guide shows, in reading order. */
export function guideText(g: Guide['data']): string[] {
  return [
    g.short,
    ...g.sections.flatMap((s) => [
      s.h,
      ...(s.p ?? []),
      ...(s.list ?? []),
      ...(s.after ?? []),
      ...(s.facts ?? []).flat(),
      s.note ?? '',
      ...(s.compare ? [...s.compare.cols, ...s.compare.rows.flat()] : []),
      ...(s.terms ?? []).flatMap((t) => [t.ru, t.def]),
    ]),
  ];
}

export function readingMinutes(g: Guide['data']): number {
  const words = guideText(g).join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export async function guidesIn(lang: Lang): Promise<Guide[]> {
  const all = await getCollection('guides', (g) => g.data.lang === lang);
  const order = (g: Guide) => GUIDE_ROUTE_IDS.indexOf(g.data.routeId as GuideRouteId);
  return all.sort((a, b) => order(a) - order(b));
}

export interface Run {
  text: string;
  href?: string;
}

const LINK = /\[([^\]]+)\]\(([A-Za-z]+)(#[a-z0-9-]+)?\)/g;

/** Splits guide text into plain runs and links. Throws on a link to a route that doesn't exist in `lang`. */
export function linkRuns(text: string, lang: Lang): Run[] {
  const out: Run[] = [];
  let at = 0;
  for (const m of text.matchAll(LINK)) {
    const [whole, label = '', id = '', hash = ''] = m;
    if (!(ROUTE_IDS as readonly string[]).includes(id)) throw new Error(`Unknown route "${id}" in guide text: ${text}`);
    if (m.index > at) out.push({ text: text.slice(at, m.index) });
    out.push({ text: label, href: routePath(id as RouteId, lang) + hash });
    at = m.index + whole.length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}
