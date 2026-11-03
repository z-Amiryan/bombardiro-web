#!/usr/bin/env node
// Prints one line per page from the Lighthouse CI run in .lighthouseci/: the four category scores and the
// main lab metrics. Used in CI logs and pull request descriptions.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/site.mjs';

const dir = join(ROOT, '.lighthouseci');
const manifestFile = join(dir, 'manifest.json');
if (!existsSync(manifestFile)) {
  console.error('lighthouse-summary: no .lighthouseci/manifest.json. Run `npm run lhci` first.');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8')).filter((r) => r.isRepresentativeRun);
const pct = (n) => (n === null || n === undefined ? '  –' : String(Math.round(n * 100)).padStart(3));
console.log('page                                          perf  a11y    bp   seo     LCP    TBT    CLS   weight');
for (const run of manifest) {
  const lhr = JSON.parse(readFileSync(run.jsonPath, 'utf8'));
  const a = lhr.audits;
  const path = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl).pathname;
  const c = lhr.categories;
  console.log(
    `${path.padEnd(44)}${pct(c.performance?.score).padStart(6)}${pct(c.accessibility?.score).padStart(6)}${pct(c['best-practices']?.score).padStart(6)}${pct(c.seo?.score).padStart(6)}` +
      `${`${(a['largest-contentful-paint'].numericValue / 1000).toFixed(2)}s`.padStart(8)}${`${Math.round(a['total-blocking-time'].numericValue)}ms`.padStart(7)}` +
      `${a['cumulative-layout-shift'].numericValue.toFixed(3).padStart(7)}${`${(a['total-byte-weight'].numericValue / 1024).toFixed(0)} KB`.padStart(9)}`,
  );
}
