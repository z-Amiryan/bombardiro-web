// Every URL on the site comes from handoff/routes.json. Nothing else may invent a path.
import routesData from '../../handoff/routes.json' with { type: 'json' };
import { SITE_URL } from '../config/site';

export const LANGS = ['en', 'ru', 'hy'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export type RouteId = keyof typeof routesData.pages;
type RouteTable = Record<RouteId, Partial<Record<Lang, string>>>;

const pages: RouteTable = routesData.pages;

export const ROUTE_IDS = Object.keys(pages) as RouteId[];
export const CORE_ROUTE_IDS = ['home', 'howToPlay', 'words', 'guides', 'support', 'about', 'privacy'] as const;
export type CoreRouteId = (typeof CORE_ROUTE_IDS)[number];
export type GuideRouteId = Exclude<RouteId, CoreRouteId>;
export const GUIDE_ROUTE_IDS = ROUTE_IDS.filter(
  (id): id is GuideRouteId => !(CORE_ROUTE_IDS as readonly string[]).includes(id),
);

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export function hasRoute(id: RouteId, lang: Lang): boolean {
  return typeof pages[id][lang] === 'string';
}

/** The path of a page in one language. Throws if that language version doesn't exist. */
export function routePath(id: RouteId, lang: Lang): string {
  const path = pages[id][lang];
  if (!path) throw new Error(`No ${lang} version of route "${id}" in handoff/routes.json`);
  return path;
}

/** The languages a page exists in, in the site's language order. */
export function routeLangs(id: RouteId): Lang[] {
  return LANGS.filter((lang) => hasRoute(id, lang));
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

/** Every language version of a page, for hreflang links. Only pairs listed in routes.json. */
export function alternates(id: RouteId): Array<{ lang: Lang; path: string }> {
  return routeLangs(id).map((lang) => ({ lang, path: routePath(id, lang) }));
}

/** The x-default target: the English version, or the page itself when it exists in one language only. */
export function xDefaultPath(id: RouteId): string {
  const langs = routeLangs(id);
  const lang = langs.includes(DEFAULT_LANG) ? DEFAULT_LANG : langs[0];
  if (!lang) throw new Error(`Route "${id}" has no language versions`);
  return routePath(id, lang);
}

export interface SwitchLink {
  lang: Lang;
  path: string;
  /** False when the page has no version in that language and the link falls back to that language's guides hub. */
  exact: boolean;
}

/** Language switcher targets: the same page in each language, or that language's guides hub. */
export function languageSwitch(id: RouteId): SwitchLink[] {
  return LANGS.map((lang) =>
    hasRoute(id, lang)
      ? { lang, path: routePath(id, lang), exact: true }
      : { lang, path: routePath('guides', lang), exact: false },
  );
}

/** getStaticPaths entries for one route id, using a rest parameter named `param`. */
export function staticPathsFor<P extends string>(id: RouteId, param: P) {
  return routeLangs(id).map((lang) => {
    const trimmed = routePath(id, lang).replace(/^\/|\/$/g, '');
    return {
      params: { [param]: trimmed === '' ? undefined : trimmed } as Record<P, string | undefined>,
      props: { lang, routeId: id },
    };
  });
}
