// Lighthouse CI on every page of the local production build, mobile settings (Lighthouse's default).
// Budgets from handoff/SPEC.md §9: Performance ≥ 95; Accessibility, Best Practices and SEO = 100; Home's
// total first-load weight ≤ 500 KB; JavaScript ≤ 30 KB on Home and ≤ 8 KB elsewhere (transfer size, the
// runtime check behind check-site's static count). Three runs per page; LHCI asserts on the best one.
const { expectedPages } = require('./scripts/lib/site.mjs');

const PORT = 4174;
const origin = `http://127.0.0.1:${PORT}`;
const pages = expectedPages();

const scores = {
  'categories:performance': ['error', { minScore: 0.95 }],
  'categories:accessibility': ['error', { minScore: 1 }],
  'categories:best-practices': ['error', { minScore: 1 }],
};

module.exports = {
  ci: {
    collect: {
      startServerCommand: `node scripts/serve.mjs --port ${PORT}`,
      startServerReadyPattern: 'Serving dist',
      url: [...pages.map((p) => origin + p.path), `${origin}/404.html`],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertMatrix: [
        {
          // Every real page: all four categories.
          matchingUrlPattern: `^${origin}/(?!404\\.html).*$`,
          assertions: { ...scores, 'categories:seo': ['error', { minScore: 1 }] },
        },
        {
          // The not-found page is noindex by design, so the SEO category doesn't apply.
          matchingUrlPattern: `^${origin}/404\\.html$`,
          assertions: scores,
        },
        {
          matchingUrlPattern: `^${origin}/((ru|hy)/)?$`,
          assertions: {
            'total-byte-weight': ['error', { maxNumericValue: 500 * 1024 }],
            'resource-summary:script:size': ['error', { maxNumericValue: 30 * 1024 }],
          },
        },
        {
          matchingUrlPattern: `^${origin}/(?!((ru|hy)/)?$).+`,
          assertions: { 'resource-summary:script:size': ['error', { maxNumericValue: 8 * 1024 }] },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
