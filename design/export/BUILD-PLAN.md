# Bombardiro site: build plan (chosen direction: 1a "Sixty seconds")

Decided 2026-11-02. Main direction is 1a. The 1b lime word-wall look is used on the **Words** page, and as a lime
"Every word is football" band on Home that links to it.

## System
- **Night (1a):** Home, How to play, Support, About, 404. Slate night palette, Archivo 900 italic display,
  floodlight cones, centre circle, a scroll-driven match clock on Home.
- **Lime (1b):** Words page and the Home words band. Tap a word to score it; rows pause; reduced motion = still wall.
- **Chalk (from 1c):** reading surfaces: Guides hub, Guide article, Privacy. App's Chalk grass light theme.

## Home section order
Hero (clock 01:00) → How a turn works (4 beats; real screens at 01:00 settings, 00:40 live card, 00:07 late,
00:00 scoreboard; desktop pins the screen and swaps it) → Every word is football (lime band) → One phone 2–4 teams
(teams screen) → No arguments (word editor screen) → Plays anywhere → Speaks your language (languages screen)
→ Crown the champions (final screen) → Quick answers (FAQ) → footer.

## Files (prototype)
- `content/{en,ru,hy}.json`, `content/words.{lang}.json`: copied from the repo, the single source of text.
- `site.js`: copy loader, `?lang=` handling, links between pages.
- `SiteHeader.dc.html`, `SiteFooter.dc.html`: shared child components.
- Pages: `Home`, `HowToPlay`, `Words`, `Guides`, `Guide`, `Support`, `About`, `Privacy`, `NotFound` (`.dc.html`).
- `Site Overview.dc.html`: every page at 390 and 1440 in iframes.
- `Design System.dc.html`: tokens, components, states, motion and reduced-motion notes.
- `OG Images.dc.html`: three 1200×630 cards.
- `handoff/DESIGN-NOTES.md`: developer notes, essentials vs. what to simplify first.

## Guide article
Alias rules guide, the only guide in all three languages (`guideAliasRules`). The template also covers a
party-game list block and a three-language glossary table.
