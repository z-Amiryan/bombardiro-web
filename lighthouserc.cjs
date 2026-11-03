// Lighthouse CI on every page of the local production build, mobile settings (Lighthouse's default).
// Budgets from handoff/SPEC.md §9: Performance ≥ 95; Accessibility, Best Practices and SEO = 100; Home's
// total first-load weight ≤ 500 KB.
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
      numberOfRuns: 1,
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
          // The not-found page answers 404 and is noindex by design, so SEO doesn't apply.
          matchingUrlPattern: `^${origin}/404\\.html$`,
          assertions: scores,
        },
        {
          matchingUrlPattern: `^${origin}/((ru|hy)/)?$`,
          assertions: { 'total-byte-weight': ['error', { maxNumericValue: 500 * 1024 }] },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
