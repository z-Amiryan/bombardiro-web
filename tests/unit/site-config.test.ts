import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import routesData from '../../handoff/routes.json' with { type: 'json' };
import { APP_STORE_ID, APP_STORE_URL, SCREENSHOT_LANG, SITE_URL, storeUrl } from '../../src/config/site';
import { DEFAULT_LANG, LANGS } from '../../src/lib/routes';

const ROOT = join(import.meta.dirname, '..', '..');

describe('storeUrl', () => {
  it('returns the plain App Store URL while there is no provider token', () => {
    expect(storeUrl('hero', '')).toBe(APP_STORE_URL);
    expect(APP_STORE_URL).toContain(`id${APP_STORE_ID}`);
  });

  it('adds one campaign per placement once a provider token exists', () => {
    expect(storeUrl('final', '12345')).toBe(`${APP_STORE_URL}?pt=12345&ct=site-final&mt=8`);
    expect(storeUrl('qr', '12345')).toContain('ct=site-qr');
  });
});

describe('site config', () => {
  it('agrees with handoff/routes.json on the address and the languages', () => {
    expect(routesData.site).toBe(SITE_URL);
    expect(routesData.locales).toEqual([...LANGS]);
    expect(routesData.defaultLocale).toBe(DEFAULT_LANG);
  });

  it('shows Russian captures on Russian pages, and every language has captures to show', () => {
    expect(SCREENSHOT_LANG.ru).toBe('ru');
    for (const lang of Object.values(SCREENSHOT_LANG)) {
      expect(existsSync(join(ROOT, 'assets/screenshots', lang, 'iphone'))).toBe(true);
    }
  });
});
