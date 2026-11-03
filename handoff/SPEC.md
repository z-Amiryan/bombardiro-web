# Bombardiro website: build spec

The contract for building bombardiro.app. Where this file and the design export disagree, this file wins
on SEO, performance, accessibility and legal rules, and the design wins on everything visual. Record any
such conflict in `handoff/DESIGN-DEVIATIONS.md`.

## 1. The product

Bombardiro is a football party word game for iPhone and iPad. 2–4 teams share one phone. A player describes
football words without saying them while a clock runs, and every word guessed is a goal. Nearly 1,700 words
per language, in English, Russian and Armenian. Free, no account, works offline.

**The site's goals, in order:** get found in search, be good enough for an Awwwards jury, get people to
install the app. Treat the app as already published.

**Everything must stay free.** The owner pays only for the domain. Don't add a paid plan, paid add-on or
any service that needs a card.

## 2. Stack

| Item          | Choice                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Framework     | `astro` 7.4.4, static output, no server adapter                                                              |
| Hosting       | Vercel Hobby, Git integration on this public repo                                                            |
| Node          | `node` 24.22.2 as a **devDependency**, plus `"engines": { "node": "24.x" }`                                  |
| Language      | TypeScript, strict                                                                                           |
| Styling       | Plain CSS with custom properties, unless the design export needs otherwise                                   |
| Interactivity | Vanilla TypeScript first. `preact` 11.1.1 with `@astrojs/preact` 6.1.1 only where a component holds real state |
| Sitemap       | `@astrojs/sitemap` 3.7.4                                                                                     |
| Analytics     | `@vercel/analytics` 2.0.1, `@vercel/speed-insights` 2.0.0                                                    |
| Tests         | `@playwright/test` 1.64.1, `@axe-core/playwright` 4.14.0, `@lhci/cli` 0.15.1, `vitest` 5.0.5                 |

**Why `node` is a devDependency:** Astro 7.4.4 requires Node ≥ 22.23.4, and the cloud VM's Node 22 may be
older. npm scripts put `node_modules/.bin` first on `PATH`, so `npm run …` uses this version everywhere.
Always run tools through npm scripts.

Astro 7.4.4, the sitemap integration, both Vercel components and the Fonts API with `fontProviders.local()`
were built together successfully on 2026-11-02. For anything else, read the installed version's docs. Don't
code from memory.

No React, Next.js, CSS-in-JS, jQuery, tag managers or client-side routers.

## 3. Repository

```text
CLAUDE.md                project rules
.claude/                 agents and rules
.github/workflows/ci.yml already in place; don't remove it
handoff/                 this spec, guide briefs, keyword map, launch checklist
content/copy/            all interface and core-page text (en, ru, hy)
content/words/           snapshot of the game's word packs
assets/                  brand files, badges, real screenshots, the video
design/inputs/           what Claude Design was given
design/export/           what Claude Design produced
scripts/                 check-copy.mjs and your site checks
src/                     you create this
```

## 4. Routes and languages

`handoff/routes.json` is the single source of URLs. Generate pages, navigation, hreflang and the sitemap from
it. 28 pages plus one 404.

- English sits at `/`, Russian at `/ru/`, Armenian at `/hy/`.
- `trailingSlash: 'always'` in Astro and `"trailingSlash": true` in `vercel.json`.
- Never redirect by IP or browser language. No language cookie.
- The language switcher is plain links with `hreflang`. It goes to the same page in the other language, or to
  that language's guides hub if there is no equivalent.
- The 404 page shows the `notFound` message from all three copy files.

## 5. Content

- **All interface and core-page text comes from `content/copy/{en,ru,hy}.json`.** No text is hard-coded in
  components. If the design needs a new string, add it to all three files.
- The key order in those files isn't a layout. The design decides order and grouping.
- `npm run check:copy` (`scripts/check-copy.mjs`) must pass. Extend it, never weaken it.
- `{date}` in `privacy.updated` comes from `LAST_UPDATED` in `src/config/site.ts`, formatted per language.
- **Words page:** built from `content/words/words.{lang}.json`, whose decks are aligned by index across
  languages. For each of the six categories take the first 24 Easy and first 12 Hard words in pack order,
  skipping words already used by an earlier category. Pick by index so all languages show the same words. Add
  a print stylesheet so the page prints cleanly on A4 with the words in columns and no navigation.
- **Guides:** write them from `handoff/guide-briefs.md` as Astro content collection entries with `title`,
  `description`, `routeId`, `datePublished` and `dateModified`.
- **Famous names** (players, clubs) may appear as plain text only. Never a photo, crest, kit or logo.

## 6. SEO

Every page needs, in the delivered HTML:

- `<html lang>`, one `<h1>`, a unique `<title>` and meta description from the copy files or guide frontmatter.
- `rel="canonical"`, plus `rel="alternate" hreflang` links for every language version and `x-default` pointing
  at English. These must sit in `<head>`, because Yandex no longer reads hreflang from sitemaps. Pair pages only
  as listed in `routes.json`.
- All main content without JavaScript. Most AI crawlers don't run it.
- Open Graph and Twitter tags, with `og:locale` and a 1200×630 image per language from the design.
- `theme-color`, favicon and `apple-touch-icon` built from `assets/brand/`.
- `<meta name="apple-itunes-app" content="app-id=6813968416">`.

**Structured data (JSON-LD):**

| Page             | Types                                                         |
| ---------------- | ------------------------------------------------------------- |
| Every page       | `Organization` (name, url, logo, email, `sameAs` socials), `WebSite` |
| Home             | `["VideoGame", "MobileApplication"]`                          |
| All except home  | `BreadcrumbList`                                              |
| Guides           | `Article`, with `Organization` as author                      |

For the app use `operatingSystem: "iOS"`, `applicationCategory: "GameApplication"`,
`offers: { price: "0", priceCurrency: "USD" }`, `inLanguage: ["en", "ru", "hy"]`.

**Never add `aggregateRating` or `review` unless the numbers are real and come from the App Store.** Don't add
FAQ markup: Google removed that rich result in June 2026.

**Other:**

- `robots.txt` allows all crawlers, including AI crawlers, and points at the sitemap.
- Sitemap excludes the 404.
- `*.vercel.app` hosts send `X-Robots-Tag: noindex`, so only bombardiro.app gets indexed.
- Internal links as listed in `handoff/keyword-map.md`.

## 7. App Store links and badge

`src/config/site.ts` holds the only copy of these values:

```ts
export const SITE_URL = 'https://bombardiro.app';
export const APP_STORE_ID = '6813968416';
// PLACEHOLDER: the owner confirms this before launch.
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;
// Provider token from App Store Connect → Analytics → Acquisition → Campaigns. Empty until the owner has it.
export const APP_STORE_PT = '';
export const APP_PRIVACY_URL = 'https://z-amiryan.github.io/bombardiro/privacy-policy/';
export const SUPPORT_EMAIL = 'bombardiro.dev@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/playbombardiro/';
export const TIKTOK_URL = 'https://www.tiktok.com/@playbombardiro';
export const LAST_UPDATED = '2026-11-02'; // update on launch day
```

`storeUrl(placement)` returns the plain URL while `APP_STORE_PT` is empty, and otherwise
`${APP_STORE_URL}?pt=${APP_STORE_PT}&ct=site-${placement}&mt=8`. Use one placement per position, for example
`hero`, `final`, `howto`, `words`, `guide`, `footer`, `qr`. Any QR code is an inline SVG generated at build time
from `storeUrl('qr')`. The link returns 404 until the app is released, so exclude it from link checks.

**Treat the app as published. Don't add "coming soon", "launching soon" or waitlist wording anywhere.**

**Apple's badge rules:**

- Use only the files in `assets/badges/`: `app-store-en.svg` for English and Armenian, `app-store-ru.svg` for
  Russian. Apple has no Armenian badge.
- One badge per page. Other calls to action are text links using `cta.textLink` or `cta.getApp`.
- Minimum 40 px high, with clear space of a quarter of its height.
- Never modify, angle or animate it. It sits below the main message, never as the dominant artwork.
- `footer.apple` appears once per page, in the footer.
- Never write "at the App Store", "Apple App Store" or "downloadable".

**Apple device images:** an iPhone or iPad frame must be Apple's official bezel, used as is. No tilting,
cropping, animating, flipping, shadows, reflections, or anything overlapping or coming out of the screen, and
copy goes beside it, not on it. Otherwise show the screen with no device. The screen must be real app UI.

## 8. Images, video and fonts

**Screens:**

- Use only real captures from `assets/screenshots/`. Never invent UI.
- `/ru/` pages use Russian captures.
- `/hy/` pages use English captures until Armenian ones exist. Keep the path configurable per language.

**Images:**

- Generate AVIF and WebP at build time with Astro's image pipeline. Vercel's Image Optimization is not used.
- Set `width` and `height` on every image.
- Largest image above the fold: `fetchpriority="high"`, not lazy. Everything else `loading="lazy"`.

**Video:**

- `assets/video/app-preview-en.mp4` is a real 25-second capture (886×1920, 12 MB) with the correct six
  categories. It appears on How to play in all three languages.
- Encode it with ffmpeg to H.264, at most 2.5 MB, `-movflags +faststart`, into `public/video/`.
- `<video controls playsinline preload="none" poster="…">`. Never autoplay with sound. Nothing loads until play.

**Press kit:**

- Build `public/press/bombardiro-press-kit.zip` with the app icon, a wordmark SVG with outlined paths made from
  Archivo, and six iPhone screenshots each in English and Russian. `about.press.kit` links to it.

**Fonts:**

- Self-hosted WOFF2 through Astro's Fonts API. Never load from a font CDN.
- Sources are the `@fontsource-variable` packages. Measured sizes: Archivo italic Latin 38 KB, Space Grotesk
  Latin 22 KB, Noto Sans Cyrillic 20 KB and italic 24 KB, Noto Sans Armenian 26 KB.
- Each language loads only its own faces, and only the ones the design uses.
- The BOMBARDIRO wordmark stays in Archivo in every language.
- Add a test that every character in `content/copy/` and the guides is covered by that language's fonts.
  Include `« » — – № ։ ՝ ՞`. Russian pages also need Noto Sans's Latin subset for punctuation.

## 9. Performance budgets

Enforced by `npm run check:site` and Lighthouse CI on every PR. Sizes are gzip.

| Measure                                     | Budget                                               |
| ------------------------------------------- | ---------------------------------------------------- |
| Field, mobile, 75th percentile              | LCP ≤ 2.0 s · INP ≤ 150 ms · CLS ≤ 0.05               |
| Lighthouse, mobile, on a local production build | Performance ≥ 95; Accessibility, Best Practices and SEO = 100 |
| JavaScript at first load, Home              | ≤ 30 KB, including the 2.4 KB of Vercel loaders      |
| JavaScript at first load, other pages       | ≤ 8 KB                                               |
| Lazy-loaded effects                         | ≤ 40 KB, capable devices only                        |
| CSS                                         | ≤ 25 KB per page                                     |
| Fonts                                       | At most 2 preloaded, ≤ 60 KB together                |
| Total first-load weight, Home               | ≤ 500 KB                                             |

Rules that protect those numbers:

- The largest paint is text or a preloaded image, and it never waits for JavaScript or an intro.
- Animate only `transform` and `opacity`. Prefer CSS scroll-driven animations (Chrome 115+, Safari 26+,
  Firefox 159+, older browsers show the final state) and native view transitions (Chrome 126+, Safari 18.2+,
  other browsers navigate normally).
- Effects load after the page is interactive and only on devices that can run them.
- `three` is 181 KB gzip and won't fit. `ogl` is 33 KB. A hand-written shader is usually enough.

## 10. Accessibility

WCAG 2.2 AA.

- Full keyboard use, a visible focus state, and a skip link.
- Text contrast 4.5:1, or 3:1 at 24 px and above. Touch targets at least 44 px.
- `prefers-reduced-motion` gets a designed version, not a broken one.
- Any sound is off by default, with a visible control.
- Text in another language carries its own `lang`, for example «бомбардир» on English pages.

## 11. Security and privacy

- `vercel.json` sets HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, a minimal `Permissions-Policy`
  and a strict `Content-Security-Policy`. Verify Vercel's analytics still works under the CSP, using hashes
  rather than `unsafe-inline` where you can.
- `_astro/` assets get `Cache-Control: public, max-age=31536000, immutable`.
- **No third-party requests at all.** A Playwright test asserts every request is same-origin. Links out are fine.
- No cookies, forms, comments or user input. Secrets don't exist in this repo and never should.

## 12. Analytics

- Add `<Analytics />` from `@vercel/analytics/astro` and `<SpeedInsights />` from
  `@vercel/speed-insights/astro` to the base layout.
- **Don't call `track()`.** Custom events need a paid plan, and the free plan has none. Installs per placement
  come from the App Store campaign links in §7.
- Add no other analytics, pixels or tag managers.

## 13. Scripts and CI

`.github/workflows/ci.yml` already calls these, so `package.json` must provide them:

| Script               | Does                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| `npm run check`      | Type check, lint, unit tests, `check:copy`                               |
| `npm run build`      | `astro build`                                                            |
| `npm run check:site` | On `dist/`: SEO lint, internal links, sitemap against routes, JSON-LD, budgets |
| `npm run test:e2e`   | Playwright against a local production build                              |
| `npm run lhci`       | Lighthouse CI against a local production build                           |

Don't edit the workflow unless it's broken. A cloud session may not be able to push workflow changes, so if it
needs a change, tell the owner what to paste.

## 14. Tests

Playwright runs on Chromium, WebKit, Firefox and an iPhone profile.

- Every route in every language: 200, correct `lang`, one `h1`, no console errors.
- With JavaScript disabled: main content and the store link are present.
- Reciprocal hreflang, and the language switcher reaches the right page.
- Only one App Store badge on any page.
- The video file isn't requested before play.
- Keyboard walkthrough of Home, and reduced-motion Home.
- axe: no serious or critical issues on every template in every language.
- Every request is same-origin.
- Screenshots of every template at 390 and 1440 px, per language, saved as CI artifacts for review.

## 15. Milestones

One PR per milestone, each with green CI and passing reviews.

1. **Scaffold:** Astro, scripts, tests, config, CI green.
2. **Foundation:** tokens, fonts, base layout, language routing, head and structured-data components.
3. **Home:** the full design, on phone and desktop, in three languages.
4. **Core pages:** How to play, Words with print view, Guides hub, Support, About, Privacy, 404.
5. **Guides:** all seven written, audited and published.
6. **Hardening:** security headers, analytics, every SEO check.
7. **Audit:** run every agent in `.claude/agents/`, fix everything found.
8. **Polish:** a dedicated pass on motion, transitions, small interactions and phone details, scored against the
   Awwwards weights: Design 40%, Usability 30%, Creativity 20%, Content 10%.
9. **Launch ready:** tick what you can in `handoff/launch-checklist.md`, then stop.

**Done means:** every check above passes, all pages exist in their languages, nothing is stubbed, and
`handoff/launch-checklist.md` lists only the owner's items.

## 16. Out of scope

A playable game in the browser, accounts, forms, newsletters, a CMS, an Android page, cookie banners, paid
services, custom analytics events, languages beyond the three, and pages per player or club.
