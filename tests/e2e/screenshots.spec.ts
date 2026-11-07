import { test } from '@playwright/test';
import { TEMPLATES } from './site';

// Full-page screenshots of every template in each language, kept as CI artifacts for design review: a phone
// (390 px, touch, mobile viewport) and a desktop (1440 px). Runs in the Chromium project only (see
// playwright.config.ts); the other browsers are covered by the functional tests.
const SIZES = [
  { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
];

for (const size of SIZES) {
  test.describe(`screenshots, ${size.name}`, () => {
    test.use(size.use);
    for (const p of TEMPLATES) {
      test(`${p.path}`, async ({ page }) => {
        await page.goto(p.path);
        await page.evaluate(() => document.fonts.ready);
        // Scroll through the page so lazy images load, then return to the top.
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `test-results/screenshots/${p.id}-${p.lang}-${size.name}.png`, fullPage: true });
      });
    }
  });
}
