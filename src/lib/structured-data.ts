// JSON-LD for handoff/SPEC.md §6. Every page: Organization and WebSite. Home: the app. Every page but Home:
// BreadcrumbList. Guides: Article. No ratings or reviews: there are no real App Store numbers to cite.
import { APP_STORE_URL, SITE_URL, SUPPORT_EMAIL, socialLinksFor } from '../config/site';
import { copyFor } from './copy';
import { absoluteUrl, LANGS, routePath, type Lang } from './routes';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type Json = Record<string, unknown>;

export function organization(lang: Lang): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: copyFor(lang).brand.name,
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png'), width: 512, height: 512 },
    email: SUPPORT_EMAIL,
    sameAs: socialLinksFor(lang).map((s) => s.url),
  };
}

export function website(lang: Lang): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: copyFor(lang).brand.name,
    inLanguage: [...LANGS],
    publisher: { '@id': ORG_ID },
  };
}

export function app(lang: Lang): Json {
  const t = copyFor(lang);
  return {
    '@type': ['VideoGame', 'MobileApplication'],
    // One node per language: each Home describes the app in its own language and URL.
    '@id': `${absoluteUrl(routePath('home', lang))}#app`,
    name: t.brand.name,
    description: t.pages.home.meta.description,
    url: absoluteUrl(routePath('home', lang)),
    image: absoluteUrl('/icon-512.png'),
    operatingSystem: 'iOS',
    applicationCategory: 'GameApplication',
    gamePlatform: ['iPhone', 'iPad'],
    inLanguage: [...LANGS],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    installUrl: APP_STORE_URL,
    publisher: { '@id': ORG_ID },
    author: { '@id': ORG_ID },
  };
}

export interface ArticleInput {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
}

/** A guide, written and published by the Organization (SPEC §6). */
export function article(a: ArticleInput): Json {
  const url = absoluteUrl(a.path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: a.title,
    description: a.description,
    inLanguage: a.lang,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(`/og/${a.lang}.jpg`),
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbs(items: Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function graph(nodes: Json[]): string {
  // Escapes "<" so no string in the data can close the script element.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}
