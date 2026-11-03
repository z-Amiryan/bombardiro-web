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
