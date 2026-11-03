import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { TEMPLATES } from './site';

for (const p of TEMPLATES) {
  test(`${p.path} has no serious or critical accessibility issues`, async ({ page }) => {
    await page.goto(p.path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const severe = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(severe).toEqual([]);
  });
}
