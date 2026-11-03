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
    // Astro's metric-matched fallbacks for Noto Sans and Noto Sans Armenian come from their Cyrillic and
    // Armenian files but are applied to Arial's Latin, which made the swap shift more, not less (quality audit,
    // milestone 2). Those two families fall back to plain Arial.
    // Noto Sans falls back to "Noto Sans fallback" (base.css), local Arial resized to Noto Sans's metrics, so
    // Russian text doesn't reflow when the font arrives late (quality audit, milestone 2).
    ...(family.name === 'Noto Sans'
      ? { fallbacks: ['Noto Sans fallback', 'Arial', 'sans-serif'], optimizedFallbacks: false }
      : family.name.startsWith('Noto')
        ? { fallbacks: ['Arial', 'sans-serif'], optimizedFallbacks: false }
        : { fallbacks: ['sans-serif'] }),
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
