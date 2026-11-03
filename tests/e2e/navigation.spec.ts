import { expect, test } from '@playwright/test';
import { alternatesOf } from '../../scripts/lib/site.mjs';
import { copyFor } from '../../src/lib/copy';
import { LANGS } from '../../src/lib/routes';
import { PAGES } from './site';

// The language switcher goes to the same page in the other language, or to that language's guides hub.
for (const p of PAGES) {
  test(`${p.path}: hreflang is reciprocal and the language links reach the right page`, async ({ page }) => {
    await page.goto(p.path);
    const alts = alternatesOf(p.id);
    for (const lang of LANGS) {
      const target = alts.find((a) => a.lang === lang)?.path ?? (await guidesHub(lang));
      const link = page.locator(`.ftr__langs a[hreflang="${lang}"]`);
      await expect(link).toHaveAttribute('href', target);
      if (alts.some((a) => a.lang === lang)) {
        // Reciprocal: the other version lists this page back.
        const res = await page.request.get(target);
        expect(await res.text()).toContain(`hreflang="${p.lang}" href="https://bombardiro.app${p.path}"`);
      }
    }
  });
}

async function guidesHub(lang: string) {
  return lang === 'en' ? '/guides/' : `/${lang}/guides/`;
}

test('the header language link opens the same page in Russian', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/how-to-play/');
  await page.locator('.hdr__langs a[hreflang="ru"]').click();
  await expect(page).toHaveURL(/\/ru\/kak-igrat\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

test.describe('menu sheet on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens from the menu button, takes focus, and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const sheet = page.locator('#site-menu');
    await expect(sheet).toBeHidden();
    await page.locator('.hdr__menu').click();
    await expect(sheet).toBeVisible();
    await expect(sheet.locator(':focus')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('lists every main page and the store link', async ({ page }) => {
    await page.goto('/ru/');
    await page.locator('.hdr__menu').click();
    const t = copyFor('ru');
    for (const label of [t.nav.home, t.nav.howToPlay, t.nav.words, t.nav.guides, t.nav.support, t.nav.about]) {
      await expect(page.locator('#site-menu nav').getByRole('link', { name: label })).toBeVisible();
    }
    await expect(page.locator('#site-menu').getByRole('link', { name: t.cta.textLink })).toHaveAttribute('href', /apps\.apple\.com/);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  test('the menu sheet still opens', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hdr__menu').click();
    await expect(page.locator('#site-menu')).toBeVisible();
  });

  for (const p of PAGES) {
    test(`${p.path} has its App Store link`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator('footer a[href^="https://apps.apple.com/"]')).toBeVisible();
    });
  }
});

test('the skip link is the first stop and jumps to the content', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit only tabs to links with the "Press Tab to highlight each item" setting on');
  await page.goto('/words/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip');
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});
