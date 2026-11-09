import { expect, test } from '@playwright/test';
import { PAGES } from './site';

test.use({ javaScriptEnabled: false });

for (const p of PAGES) {
  test(`${p.path} reads properly with JavaScript off`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.locator('h1')).toBeVisible();
    const text = (await page.locator('main').innerText()).trim();
    expect(text.length).toBeGreaterThan(20);
  });
}

test('word lists are plain text with JavaScript off, not buttons that do nothing', async ({ page }) => {
  for (const path of ['/', '/words/']) {
    await page.goto(path);
    await expect(page.locator('main [data-key][role="button"], main button[data-key]')).toHaveCount(0);
    expect(await page.locator('main [data-key]').count()).toBeGreaterThan(20);
  }
});
