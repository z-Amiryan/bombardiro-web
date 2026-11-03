import { expect, test } from '@playwright/test';
import { LANGS } from '../../src/lib/routes';
import { copyFor } from '../../src/lib/copy';
import { PAGES, watch } from './site';

for (const p of PAGES) {
  test(`${p.path} loads in ${p.lang} with one h1 and no errors or third-party requests`, async ({ page, baseURL }) => {
    const problems = watch(page, new URL(baseURL!).origin);
    const response = await page.goto(p.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', p.lang);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('img[src*="/app-store-"]').count()).toBeLessThanOrEqual(1);
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });
}

test('an unknown address shows the 404 page in all three languages', async ({ page, baseURL }) => {
  const problems = watch(page, new URL(baseURL!).origin, { expectStatus: 404 });
  const response = await page.goto('/ru/no-such-page/');
  expect(response?.status()).toBe(404);
  for (const lang of LANGS) {
    await expect(page.locator(`[lang="${lang}"]`).getByText(copyFor(lang).notFound.title, { exact: true })).toBeVisible();
  }
  expect(problems).toEqual([]);
});

test('trailing slashes follow Vercel: added to pages, removed after file names', async ({ request }) => {
  const page = await request.get('/how-to-play', { maxRedirects: 0 });
  expect(page.status()).toBe(308);
  expect(page.headers()['location']).toBe('/how-to-play/');
  const file = await request.get('/robots.txt/', { maxRedirects: 0 });
  expect(file.status()).toBe(308);
  expect(file.headers()['location']).toBe('/robots.txt');
});

test('a malformed address is a 404, and the server keeps serving', async ({ request }) => {
  expect((await request.get('/%E0%A4%A.png')).status()).toBe(404);
  expect((await request.get('/')).status()).toBe(200);
});
