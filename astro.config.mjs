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
    // Both fall back to "Noto Sans fallback" (base.css), local Arial resized to Noto Sans's Latin metrics, so
    // Russian text, and the Latin words in Armenian text (Noto Sans Armenian's Latin is Noto Sans's), don't
    // reflow when the font arrives late (quality audits, milestones 2 and 4). Arial has no Armenian, so
    // Armenian letters fall through to the system's Armenian face as before.
    // Archivo and Space Grotesk use "<name> fallback" faces in base.css with Astro's own metric numbers: Astro's
    // generated face lists only local Arial, so without Arial (Linux, ChromeOS) text fell back unsized and
    // reflowed. Ours also accept Arial's metric twins, Liberation Sans and Arimo.
    // The Armenian word-wall face has no fallbacks of its own: it sits in front of the Armenian display stack.
    ...(family.name.startsWith('Noto')
      ? { fallbacks: ['Noto Sans fallback', 'Arial', 'sans-serif'], optimizedFallbacks: false }
      : family.name.startsWith('Bombardiro')
        ? { fallbacks: [], optimizedFallbacks: false }
        : { fallbacks: [`${family.name} fallback`, 'Arial', 'sans-serif'], optimizedFallbacks: false }),
    display: 'swap',
    options: {
      variants: /** @type {[any, ...any[]]} */ (
        family.variants.map((v) => ({ src: [v.src], weight: '100 900', style: v.style, unicodeRange: [v.unicodeRange] }))
      ),
    },
  })),
  // Content-Security-Policy (SPEC §11): Astro hashes every script and style it renders and writes the policy
  // as a <meta> in each page, so nothing inline runs without its hash and nothing needs 'unsafe-inline'. The
  // directives a <meta> can't carry (frame-ancestors) and the other security headers are in vercel.json.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
  // The sitemap integration leaves out the 404 page by itself.
  integrations: [sitemap()],
});
