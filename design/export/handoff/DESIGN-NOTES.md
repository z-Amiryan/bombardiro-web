# Bombardiro web: notes for the developer

Direction **1a "Sixty seconds"**. The **Lime** surface (from 1b) is used on Words and on Home's words band. The
**Chalk** surface (the app's Chalk grass theme) is used for Guides, Guide and Privacy. The prototype pages
(`*.dc.html`) are the visual spec, `Design System.dc.html` holds the tokens, states and motion table, and
`Site Overview.dc.html` shows every page at 390 and 1440.

## Essential (don't cut)
1. **Static, real-text H1 and lead on every page.** These are the LCP element. No intro, no font-swap jank:
   preload only the display weight for the page's language, with `font-display: swap` and size-adjusted
   fallbacks.
2. **The Home match clock.** 01:00 → 00:00 across the four turn beats, red at ≤ 10 s, each beat paired with its
   real screen. Use a CSS scroll timeline where supported, with a ≈1 KB rAF + IntersectionObserver fallback.
   It's the site's one big idea.
3. **Real screenshots, no device frames,** each with the alt text in the prototype. The RU pages use the `ru-*`
   captures; HY uses `en-*` until Armenian captures exist.
4. **Three surfaces, one per page type** (Night, Lime, Chalk), plus per-script type: Archivo / Space Grotesk
   (EN), Noto Sans (RU), Noto Sans Armenian upright (HY). Each page loads only its own language's fonts.
5. **Badge rules:** Apple's artwork once per page, 48 px high, never animated. All other store links are text
   links. Desktop shows a QR code next to the badge.
6. **Reduced motion:** see the motion table. Every animation has a static state, and nothing that carries meaning
   relies on motion.
7. **Words print sheet:** A4, one category per page, dashed cut grid, `@page { size: A4; margin: 12mm }`.

## Simplify first if a budget gets tight
1. Drop the **floodlight shader** (it's optional anyway). The CSS cones already ship.
2. Replace the **desktop pinned-screen crossfade** with inline screens, as on phone.
3. Make the **Home word wall** static: keep tap-to-score, drop the drift.
4. Drop the **clock pill** (keep the hero clock and the header bar).
5. Drop **view transitions** (keep the instant navigation).
6. Last resort: a static clock that shows each beat's time stamp. This is the reduced-motion version, and it still tells the story.

## Budget estimate (gzipped)
- Home first load: clock fallback + accordion + word wall + header ≈ 6–8 KB JS. Lazy: whistle toggle ≈ 1 KB,
  shader ≈ 5 KB. Fonts: about 38 KB for the EN display and body subsets. Hero images: none (text-only LCP).
  Screens are lazy AVIF at 2×, about 45 KB each.
- Other pages: ≤ 3 KB JS (menu, accordion, TOC tracking, copy buttons).

## Notes and open items
- **Text I added is flagged, not approved:** alt text for every screenshot, the whistle labels, the goal counter
  labels and plurals, Pause / Play, "Copy address", "Copy text", the 404 `<title>`, and the guide reading-time
  labels. **The guide article in all three languages is a draft written to `guide-briefs.md` and needs an
  editor; RU and HY need native speakers.**
- Guides hub: only `guideAliasRules` exists in all three languages. The prototype links every card to it.
- Words page: the prototype shows the first 32 Easy and 32 Hard words per category. Confirm how many words are
  public before launch.
- Press kit zip (`/press-kit.zip`) and the QR SVG are placeholders.
- `whistle.m4a` wasn't copied into the prototype. Lazy-load it from `assets/brand/` on the first toggle.
- No Instagram link on RU pages (per the existing footer rule). Social links use `rel="me noopener"`.
- OG images: `OG Images.dc.html`, one per language at 1200×630. Generate them at build time or export them from
  that file.
- Favicon / touch icon: no change. Generate a 180 px `apple-touch-icon` from `brand/icon.png`. Set `theme-color`
  per surface (#101418 / #BFF747 / #EEF2E9).
