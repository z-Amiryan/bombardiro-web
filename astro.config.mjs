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
    // Component CSS stays in external files. The only inline styles are the @font-face blocks from Astro's
    // <Font>, whose hashes are stable, which keeps the Content-Security-Policy in vercel.json short.
    inlineStylesheets: 'never',
  },
  // The sitemap integration leaves out the 404 page by itself.
  integrations: [sitemap()],
});
