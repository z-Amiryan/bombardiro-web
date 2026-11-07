// SPEC §11 and §12: security headers from vercel.json (served the same way by scripts/serve.mjs), the
// hash-based Content-Security-Policy in every page, no CSP violations, and the analytics in the layout.
import { expect, test } from '@playwright/test';
import { PAGES } from './site';

test.describe('security headers', () => {
  test('every page sends HSTS, nosniff, the referrer policy, DENY framing and a minimal Permissions-Policy', async ({ request }) => {
    for (const path of ['/', '/ru/guides/futbolnye-terminy/', '/404.html']) {
      const headers = (await request.get(path)).headers();
      expect(headers['strict-transport-security']).toBe('max-age=63072000; includeSubDomains; preload');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
      expect(headers['permissions-policy']).toContain('camera=()');
    }
  });

  test('built assets are cached for a year, and *.vercel.app is never indexed', async ({ request, page }) => {
    await page.goto('/');
    const css = await page.locator('link[rel="stylesheet"][href^="/_astro/"]').first().getAttribute('href');
    expect((await request.get(css ?? '')).headers()['cache-control']).toBe('public, max-age=31536000, immutable');
    const preview = await request.get('/', { headers: { host: 'bombardiro-web-git-main.vercel.app' } });
    expect(preview.headers()['x-robots-tag']).toBe('noindex');
    expect((await request.get('/')).headers()['x-robots-tag']).toBeUndefined();
  });
});

test.describe('Content-Security-Policy', () => {
  test('every page carries a hash-based policy, with no unsafe-inline or unsafe-eval', async ({ request }) => {
    for (const p of [...PAGES, { path: '/404.html' }]) {
      const html = await (await request.get(p.path)).text();
      const policy = html.match(/<meta http-equiv="content-security-policy" content="([^"]+)"/)?.[1] ?? '';
      expect(policy, p.path).toContain("default-src 'self'");
      expect(policy, p.path).toMatch(/script-src 'self' 'sha256-/);
      expect(policy, p.path).not.toMatch(/unsafe-inline|unsafe-eval/);
    }
  });

  test('Home and a guide run without a single CSP violation', async ({ page }) => {
    const violations: string[] = [];
    await page.exposeFunction('reportViolation', (v: string) => violations.push(v));
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) =>
        (window as unknown as { reportViolation: (v: string) => void }).reportViolation(`${e.violatedDirective} ${e.blockedURI}`),
      );
    });
    for (const path of ['/', '/words/', '/how-to-play/', '/guides/how-to-play-alias/']) {
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState('networkidle');
    }
    expect(violations).toEqual([]);
  });
});

test('the layout loads Vercel Web Analytics and Speed Insights, and nothing else', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('vercel-analytics')).toHaveCount(1);
  await expect(page.locator('vercel-speed-insights')).toHaveCount(1);
});
