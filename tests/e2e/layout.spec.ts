// Every page, in every language, fits every width from 320 px up: the page never scrolls sideways and no text
// is wider than its box. Big type sized by .fit (src/styles/base.css) declares a --fit at least as wide as its
// longest word, as this browser draws it.
import { expect, test, type Page } from '@playwright/test';
import { PAGES, type SitePage } from './site';

const WIDTHS = [320, 360, 390, 768, 1000, 1024, 1280, 1440, 1920, 2560];
const pages: SitePage[] = [...PAGES, { id: 'notFound', lang: 'en', path: '/404.html' }];

/** Overflow at the current width, as messages. Text clipped or scrolled on purpose is skipped. */
function overflows(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const root = document.documentElement;
    if (root.scrollWidth > root.clientWidth) out.push(`the page is ${root.scrollWidth}px wide`);
    const skip = '[hidden], .sr-only, template, svg, [aria-hidden="true"], [popover]:not(:popover-open)';
    const seen = new Set<Element>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!el || seen.has(el) || !node.textContent?.trim() || el.closest(skip)) continue;
      // The box the text lays out in: the nearest ancestor that isn't inline.
      let box: Element = el;
      while (box.parentElement && getComputedStyle(box).display.startsWith('inline')) box = box.parentElement;
      const cs = getComputedStyle(box);
      if (cs.overflowX !== 'visible' || cs.visibility === 'hidden') continue;
      const r = box.getBoundingClientRect();
      if (!r.width) continue;
      const left = r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
      const right = r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        const over = Math.max(line.right - right, left - line.left);
        if (line.width && over > 1) {
          seen.add(el);
          out.push(`"${node.textContent.trim().slice(0, 40)}" is ${Math.round(over)}px wider than its box`);
          break;
        }
      }
      // Big type wraps between words, never inside one ("SUPPO / RT"). Hyphenated words may break at the hyphen.
      if (!seen.has(el) && el.closest('.display')) {
        for (const m of node.textContent.matchAll(/[^\s\-‑]+/gu)) {
          const word = document.createRange();
          word.setStart(node, m.index);
          word.setEnd(node, m.index + m[0].length);
          const tops = new Set([...word.getClientRects()].filter((r) => r.width).map((r) => Math.round(r.top)));
          if (tops.size > 1) {
            seen.add(el);
            out.push(`"${m[0]}" breaks across lines`);
            break;
          }
        }
      }
    }
    return out;
  });
}

for (const p of pages) {
  test(`${p.path} fits every width from 320 px`, async ({ page }) => {
    await page.setViewportSize({ width: WIDTHS[0]!, height: 800 });
    await page.goto(p.path);
    const problems: string[] = [];
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      await page.evaluate(() => document.fonts.ready);
      problems.push(...(await overflows(page)).map((m) => `${width}px: ${m}`));
    }
    expect(problems).toEqual([]);
  });

  test(`${p.path} declares a wide enough --fit for its big type`, async ({ page }) => {
    await page.goto(p.path);
    await page.evaluate(() => document.fonts.ready);
    const problems = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('.fit')) {
        const name = `.${[...el.classList].join('.')}`;
        const text = el.querySelector<HTMLElement>(':scope > .fit__t');
        const fit = parseFloat(getComputedStyle(el).getPropertyValue('--fit'));
        if (!text || !fit) {
          out.push(`${name} needs a .fit__t child and a --fit`);
          continue;
        }
        // Each word at 100 px, in the same face and letter-spacing as drawn.
        const cs = getComputedStyle(text);
        const probe = document.createElement('span');
        probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap';
        probe.style.font = `${cs.fontStyle} ${cs.fontWeight} 100px/1 ${cs.fontFamily}`;
        probe.style.textTransform = cs.textTransform;
        probe.style.letterSpacing = getComputedStyle(el).getPropertyValue('--ls').trim() || 'normal';
        el.append(probe);
        let longest = 0;
        let word = '';
        for (const w of (text.textContent ?? '').trim().split(/\s+/)) {
          probe.textContent = w;
          const em = probe.getBoundingClientRect().width / 100;
          if (em > longest) [longest, word] = [em, w];
        }
        probe.remove();
        // A small margin: at the drawn size, rounding can make the word a hair wider than at 100 px.
        if (longest > fit - 0.01) out.push(`${name}: "${word}" is ${longest.toFixed(3)}em wide; --fit is ${fit}`);
      }
      return out;
    });
    expect(problems).toEqual([]);
  });
}
