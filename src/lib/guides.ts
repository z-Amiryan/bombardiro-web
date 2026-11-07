// The guides in one language, in the order handoff/routes.json lists them, with their reading time.
import { getCollection, type CollectionEntry } from 'astro:content';
import { GUIDE_ROUTE_IDS, type GuideRouteId, type Lang } from './routes';

export type Guide = CollectionEntry<'guides'>;

/** Reading speed for the "min read" label, in words per minute. */
const WORDS_PER_MINUTE = 200;

export function readingMinutes(markdown: string): number {
  const words = markdown.replace(/[#>*_`|-]/g, ' ').split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export async function guidesIn(lang: Lang): Promise<Guide[]> {
  const all = await getCollection('guides', (g) => g.data.lang === lang);
  const order = (g: Guide) => GUIDE_ROUTE_IDS.indexOf(g.data.routeId as GuideRouteId);
  return all.sort((a, b) => order(a) - order(b));
}

export async function guideFor(routeId: GuideRouteId, lang: Lang): Promise<Guide | undefined> {
  return (await guidesIn(lang)).find((g) => g.data.routeId === routeId);
}
