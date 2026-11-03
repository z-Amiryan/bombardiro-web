// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { FONT_FAMILIES } from './src/config/fonts.ts';
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
  // Self-hosted WOFF2 from the @fontsource-variable packages (src/config/fonts.ts). Each language's pages
  // load only their own families; see src/components/Fonts.astro.
  fonts: FONT_FAMILIES.map((family) => ({
    provider: fontProviders.local(),
    name: family.name,
    cssVariable: family.cssVariable,
    fallbacks: ['sans-serif'],
    display: 'swap',
    options: {
      variants: /** @type {[any, ...any[]]} */ (
        family.variants.map((v) => ({ src: [v.src], weight: '100 900', style: v.style, unicodeRange: [v.unicodeRange] }))
      ),
    },
  })),
  // The sitemap integration leaves out the 404 page by itself.
  integrations: [sitemap()],
});
