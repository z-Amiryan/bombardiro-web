import { describe, expect, it } from 'vitest';
import { APP_STORE_ID, APP_STORE_PT, APP_STORE_URL, SCREENSHOT_LANG, storeUrl } from '../../src/config/site';

describe('storeUrl', () => {
  it('returns the plain App Store URL while there is no provider token', () => {
    expect(APP_STORE_PT).toBe('');
    expect(storeUrl('hero')).toBe(APP_STORE_URL);
    expect(APP_STORE_URL).toContain(`id${APP_STORE_ID}`);
  });

  it('adds one campaign per placement once a provider token exists', () => {
    expect(storeUrl('final', '12345')).toBe(`${APP_STORE_URL}?pt=12345&ct=site-final&mt=8`);
    expect(storeUrl('qr', '12345')).toContain('ct=site-qr');
  });
});

describe('screenshots', () => {
  it('shows Russian captures on Russian pages and English ones on Armenian pages for now', () => {
    expect(SCREENSHOT_LANG).toEqual({ en: 'en', ru: 'ru', hy: 'en' });
  });
});
