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

test('a path without its trailing slash redirects to the canonical address', async ({ request }) => {
  const response = await request.get('/how-to-play', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()['location']).toBe('/how-to-play/');
});
