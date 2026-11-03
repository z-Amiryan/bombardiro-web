// Pages and helpers shared by the end-to-end tests.
import type { Page } from '@playwright/test';
import { expectedPages } from '../../scripts/lib/site.mjs';
import { GUIDE_ROUTE_IDS } from '../../src/lib/routes';

export interface SitePage {
  id: string;
  lang: 'en' | 'ru' | 'hy';
  path: string;
}

export const PAGES: SitePage[] = expectedPages().map(({ id, lang, path }) => ({ id, lang, path }));

/** Every guide shares one template. */
const template = (id: string) => ((GUIDE_ROUTE_IDS as readonly string[]).includes(id) ? 'guide' : id);

/** One page per template and language, plus the 404, for the slower checks (axe, screenshots). */
export const TEMPLATES: SitePage[] = [
  ...PAGES.filter((p, i, all) => all.findIndex((q) => template(q.id) === template(p.id) && q.lang === p.lang) === i),
  { id: 'notFound', lang: 'en', path: '/404.html' },
];

/**
 * Collects console errors, page errors, failed responses and any request that leaves the site's origin.
 * `expectStatus` is the status the document itself should have (404 for the not-found page); only the
 * document may have it, and the browser's own log line for it is not counted.
 */
export function watch(page: Page, origin: string, { expectStatus = 200 }: { expectStatus?: number } = {}) {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // Browsers log every failed response; those are checked precisely by the response listener below.
    if (/^Failed to load resource: the server responded with a status of \d+/.test(msg.text())) return;
    problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`page error: ${err.message}`));
  page.on('response', (res) => {
    const status = res.status();
    const isDocument = res.request().isNavigationRequest() && res.request().frame() === page.mainFrame();
    const isRedirect = status >= 300 && status < 400;
    const failed = isDocument ? status !== expectStatus && !isRedirect : status >= 400;
    if (failed) problems.push(`${status} for ${res.url()}`);
  });
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.protocol === 'data:' || url.protocol === 'blob:') return;
    if (url.origin !== origin) problems.push(`third-party request: ${req.url()}`);
  });
  return problems;
}
