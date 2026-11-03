import { test } from '@playwright/test';
import { TEMPLATES } from './site';

// Full-page screenshots of every template at phone and desktop width in each language, kept as CI artifacts
// for design review. Runs in the Chromium project only (see playwright.config.ts); the other browsers are
// covered by the functional tests.
test.describe('screenshots', () => {
  for (const width of [390, 1440]) {
    for (const p of TEMPLATES) {
      test(`${p.path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
        await page.goto(p.path);
        await page.waitForLoadState('networkidle');
        const name = `${p.id}-${p.lang}-${width}.png`;
        await page.screenshot({ path: `test-results/screenshots/${name}`, fullPage: true });
      });
    }
  }
});
