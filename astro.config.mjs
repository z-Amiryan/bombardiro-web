// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { SITE_URL } from './src/config/site.ts';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Component CSS stays in external files. The only inline styles left are the @font-face blocks from
    // Astro's <Font> and, on a page with an island, Astro's one-line astro-island style. Both are stable, so
    // the Content-Security-Policy keeps a short list of hashes.
    inlineStylesheets: 'never',
  },
  // The sitemap integration leaves out the 404 page by itself.
  integrations: [sitemap()],
});
