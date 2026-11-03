import { expect, test, type Page } from '@playwright/test';
import { copyFor } from '../../src/lib/copy';

const scaleOf = async (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    const m = getComputedStyle(el).transform;
    return m === 'none' ? 1 : Number(m.slice(m.indexOf('(') + 1).split(',')[0]);
  });

test.describe('Home on a wide screen', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the match clock runs down as the turn scrolls by, and the pinned screen follows the beats', async ({ page }) => {
    await page.goto('/');
    expect(await scaleOf(page, '.hero .bar__fill')).toBeCloseTo(1, 2);
    await page.locator('#beat-3').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight / 2 + el.offsetHeight * 0.6));
    await expect.poll(() => scaleOf(page, '.hero .bar__fill')).toBeLessThan(7 / 60);
    await expect(page.locator('[data-pinned] [data-beat="3"]')).toHaveAttribute('data-state', 'on');
    await expect(page.locator('.home')).toHaveAttribute('data-in-turn', '');
    await expect(page.locator('.pill')).toBeVisible();
  });

  test('a keyboard reaches the skip link, the store badge, the four beats and the rules in order', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit only tabs to links with "Press Tab to highlight each item" on');
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.hero .badge')).toBeFocused();
    for (let n = 1; n <= 4; n++) {
      await page.keyboard.press('Tab');
      await expect(page.locator(`.hero__beats a[href="#beat-${n}"]`)).toBeFocused();
    }
    await page.keyboard.press('Tab');
    await expect(page.locator('.turn__cta')).toBeFocused();
    const outline = await page.locator('.turn__cta').evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });

  test('every stop on the tab path is visible and nothing hidden takes focus', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit only tabs to links with "Press Tab to highlight each item" on');
    await page.goto('/');
    const seen: string[] = [];
    for (let i = 0; i < 160; i++) {
      await page.keyboard.press('Tab');
      const stop = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        const hidden = el.closest('[aria-hidden="true"], [inert]') !== null;
        return { text: (el.textContent ?? '').trim().slice(0, 30), visible: r.width > 0 && r.height > 0, hidden };
      });
      if (!stop) break;
      expect(stop.visible, `"${stop.text}" is focusable but has no size`).toBe(true);
      expect(stop.hidden, `"${stop.text}" is inside aria-hidden content`).toBe(false);
      seen.push(stop.text);
    }
    expect(seen.length).toBeGreaterThan(30);
  });
});

test.describe('Home word wall', () => {
  // The rows drift; pause them so the test can click a word twice in the same place.
  const pauseWall = async (page: Page) => {
    await page.locator('[data-pause]').scrollIntoViewIfNeeded();
    await page.locator('[data-pause]').click();
  };

  test('tapping a word scores it in both copies, counts it and undoes it', async ({ page }) => {
    await page.goto('/');
    await pauseWall(page);
    const word = page.locator('.band .word[data-key="players-0"]');
    await word.first().click();
    await expect(word.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(word.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-count]')).toHaveText('01');
    await expect(page.locator('[data-count-label]')).toHaveText(copyFor('en').pages.home.wall.goals.one);
    await word.first().click();
    await expect(word.nth(0)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-count]')).toHaveText('00');
  });

  test('the Russian counter uses Russian plurals', async ({ page }) => {
    await page.goto('/ru/');
    await pauseWall(page);
    const goals = copyFor('ru').pages.home.wall.goals;
    await expect(page.locator('[data-count-label]')).toHaveText(goals.many);
    for (const key of ['players-0', 'players-3']) await page.locator(`.band .word[data-key="${key}"]`).first().click();
    await expect(page.locator('[data-count-label]')).toHaveText(goals.few);
  });

  test('Pause stops the rows and becomes Play', async ({ page }) => {
    await page.goto('/');
    const pause = page.locator('[data-pause]');
    const wall = copyFor('en').pages.home.wall;
    await pause.scrollIntoViewIfNeeded();
    await pause.click();
    await expect(page.locator('[data-wall]')).toHaveAttribute('data-paused', '');
    await expect(pause).toHaveText(wall.play);
    const state = await page.locator('.row__track').first().evaluate((el) => getComputedStyle(el).animationPlayState);
    expect(state).toBe('paused');
    await pause.click();
    await expect(pause).toHaveText(wall.pause);
  });
});

test.describe('Home with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  test('nothing counts or drifts, and every beat keeps its own time stamp', async ({ page }) => {
    await page.goto('/');
    await page.locator('#beat-3').scrollIntoViewIfNeeded();
    expect(await scaleOf(page, '.hero .bar__fill')).toBeCloseTo(1, 2);
    await expect(page.locator('.pill')).toBeHidden();
    const animation = await page.locator('.row__track').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe('none');
    await expect(page.locator('#beat-3 .beat__time')).toHaveText('00:07');
    const opacity = await page.locator('#beat-2 .beat__title').evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBe(1);
  });
});

test('Russian beats pair the late stamp with the Russian screen (00:08)', async ({ page }) => {
  await page.goto('/ru/');
  await expect(page.locator('#beat-3 .beat__time')).toHaveText('00:08');
});
