// How to play, Words, Support and About: the behaviour each page adds beyond the checks every page gets.
import { expect, test } from '@playwright/test';
import { copyFor } from '../../src/lib/copy';
import { WORDS_PAGE_COUNT } from '../../src/lib/words';

test.describe('How to play', () => {
  test('the video loads nothing until it is played (SPEC §14)', async ({ page, browserName }) => {
    const videoRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().endsWith('.mp4')) videoRequests.push(req.url());
    });
    await page.goto('/how-to-play/');
    await page.locator('#video').scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    expect(videoRequests).toEqual([]);

    const play = page.getByRole('button', { name: copyFor('en').pages.howToPlay.video.play });
    await expect(play).toBeVisible();
    // Headless Firefox and WebKit builds can't decode H.264, so only Chromium checks that playing fetches it.
    test.skip(browserName !== 'chromium', 'H.264 playback is checked in Chromium');
    await Promise.all([page.waitForRequest((req) => req.url().endsWith('/video/app-preview-en.mp4')), play.click()]);
    await expect(play).toBeHidden();
    await expect(page.locator('#video video[data-src]')).toHaveJSProperty('controls', true);
  });

  test('without JavaScript the video keeps the browser controls', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/how-to-play/');
    const video = page.locator('#video noscript video, #video video:not([hidden])');
    await expect(video).toHaveCount(1);
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('controls', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await context.close();
  });
});

test.describe('Words', () => {
  test(`lists ${WORDS_PAGE_COUNT.easy} Easy and ${WORDS_PAGE_COUNT.hard} Hard words in each of the six categories`, async ({ page }) => {
    await page.goto('/ru/slova/');
    await expect(page.locator('.cat')).toHaveCount(6);
    for (const cat of await page.locator('.cat').all()) {
      await expect(cat.locator('.level').nth(0).locator('.w')).toHaveCount(WORDS_PAGE_COUNT.easy);
      await expect(cat.locator('.level').nth(1).locator('.w')).toHaveCount(WORDS_PAGE_COUNT.hard);
    }
  });

  test('tapping words scores goals in the pill, with the right plural, and reset clears them', async ({ page }) => {
    const ru = copyFor('ru').pages;
    await page.goto('/ru/slova/');
    const pill = page.locator('[data-pill]');
    await expect(pill).toBeHidden();
    const words = page.locator('#players .w');
    await words.nth(0).click();
    await expect(words.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(pill).toBeVisible();
    await expect(pill.locator('[data-count]')).toHaveText('01');
    await expect(pill.locator('[data-count-label]')).toHaveText(ru.home.wall.goals.one);
    await words.nth(1).click();
    await expect(pill.locator('[data-count-label]')).toHaveText(ru.home.wall.goals.few);
    await pill.getByRole('button', { name: ru.words.reset }).click();
    await expect(page.locator('#players .w[aria-pressed="true"]')).toHaveCount(0);
    await expect(pill).toBeHidden();
  });

  test('a word scores from the keyboard too', async ({ page }) => {
    await page.goto('/words/');
    const word = page.locator('#players .w').first();
    await expect(word).toHaveAttribute('role', 'button');
    await word.focus();
    await page.keyboard.press('Enter');
    await expect(word).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press(' ');
    await expect(word).toHaveAttribute('aria-pressed', 'false');
  });

  test('prints one sheet per category, with the words in four columns and no navigation', async ({ page }) => {
    await page.goto('/words/');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.hdr')).toBeHidden();
    await expect(page.locator('.ftr')).toBeHidden();
    await expect(page.locator('.chips')).toBeHidden();
    await expect(page.locator('.sheet-head')).toHaveCount(6);
    await expect(page.locator('#players .sheet-head')).toBeVisible();
    const columns = await page.locator('#players .level__words').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(4);
    expect(await page.locator('#players').evaluate((el) => getComputedStyle(el).breakAfter)).toBe('page');
  });
});

test.describe('Support and About', () => {
  test('the copy buttons appear with JavaScript', async ({ page }) => {
    await page.goto('/support/');
    await expect(page.getByRole('button', { name: copyFor('en').pages.support.contact.copy })).toBeVisible();
    await page.goto('/about/');
    await expect(page.getByRole('button', { name: copyFor('en').pages.about.press.copy })).toBeVisible();
  });

  test('the press kit downloads as a zip', async ({ request }) => {
    const res = await request.get('/press/bombardiro-press-kit.zip');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('application/zip');
    const body = await res.body();
    expect(body.subarray(0, 4).toString('hex')).toBe('504b0304');
  });
});
