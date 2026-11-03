import { describe, expect, it } from 'vitest';
import routesData from '../../handoff/routes.json' with { type: 'json' };
import {
  alternates,
  hasRoute,
  languageSwitch,
  LANGS,
  ROUTE_IDS,
  routePath,
  staticPathsFor,
  xDefaultPath,
} from '../../src/lib/routes';

describe('routes', () => {
  it('lists 28 pages across the three languages', () => {
    const count = ROUTE_IDS.reduce((n, id) => n + LANGS.filter((l) => hasRoute(id, l)).length, 0);
    expect(count).toBe(28);
  });

  it('puts every page under its language prefix, with slashes at both ends', () => {
    for (const id of ROUTE_IDS) {
      for (const lang of LANGS) {
        if (!hasRoute(id, lang)) continue;
        const path = routePath(id, lang);
        expect(path.startsWith('/') && path.endsWith('/')).toBe(true);
        if (lang === 'en') expect(path).not.toMatch(/^\/(ru|hy)\//);
        else expect(path.startsWith(`/${lang}/`)).toBe(true);
      }
    }
  });

  it('never gives two pages the same URL', () => {
    const all = Object.values(routesData.pages).flatMap((byLang) => Object.values(byLang));
    expect(new Set(all).size).toBe(all.length);
  });

  it('pairs only the language versions listed in routes.json', () => {
    expect(alternates('guideOnePhone').map((a) => a.lang)).toEqual(['en', 'ru']);
    expect(alternates('guideGlossary')).toEqual([{ lang: 'ru', path: '/ru/guides/futbolnye-terminy/' }]);
    expect(alternates('home').map((a) => a.path)).toEqual(['/', '/ru/', '/hy/']);
  });

  it('points x-default at English, or at the only version a page has', () => {
    expect(xDefaultPath('words')).toBe('/words/');
    expect(xDefaultPath('guideGlossary')).toBe('/ru/guides/futbolnye-terminy/');
  });

  it('sends the language switcher to the same page, or that language’s guides hub', () => {
    expect(languageSwitch('guideFootballParty')).toEqual([
      { lang: 'en', path: '/guides/football-party-games/', exact: true },
      { lang: 'ru', path: '/ru/guides/', exact: false },
      { lang: 'hy', path: '/hy/guides/', exact: false },
    ]);
    expect(languageSwitch('support').every((l) => l.exact)).toBe(true);
  });

  it('builds static paths with an empty rest parameter for the root', () => {
    expect(staticPathsFor('home', 'home')).toEqual([
      { params: { home: undefined }, props: { lang: 'en', routeId: 'home' } },
      { params: { home: 'ru' }, props: { lang: 'ru', routeId: 'home' } },
      { params: { home: 'hy' }, props: { lang: 'hy', routeId: 'home' } },
    ]);
  });

  it('refuses a language version that does not exist', () => {
    expect(() => routePath('guideFootballParty', 'hy')).toThrow();
  });
});
