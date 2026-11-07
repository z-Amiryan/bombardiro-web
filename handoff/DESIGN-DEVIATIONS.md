# Design deviations

Every place the build departs from `design/export/`, and why. `handoff/SPEC.md` wins on SEO, performance,
accessibility and legal rules; the design wins on everything visual. Each change is the smallest one that keeps
the design's idea.

## Type and fonts

| Where | Design | Build | Why |
| --- | --- | --- | --- |
| BOMBARDIRO wordmark (header, menu sheet, footer, print sheet, guide card) | Live text in Archivo 900 italic on every page | The same letters as outlined SVG paths, shaped from the site's own Archivo file with the design's letter-spacing (`scripts/build-font-assets.py`) | SPEC §8: each language loads only its own fonts. Russian and Armenian pages would otherwise download Archivo for one word. The result is pixel-identical. |
| «бомбардир» on About | Live text in Noto Sans 900 italic on every page | Outlined SVG, same font and letter-spacing | Same reason: English and Armenian pages don't load Noto Sans. |
| Foreign-script words in body text (the language names in the switcher, «бомбардир» in About's text) | System fallback font | Tiny glyph subsets of Noto Sans and Noto Sans Armenian (4–6 KB), part of each language's body family | Look designed, not tolerated; a download happens only where those characters appear. |
| Russian display headings | Line-heights from 0.84 to 0.95, as in English | Line-height 1 | The breve of Й (and the dots of Ё) ran into the line above at the tighter values. |

## Layout and components

| Where | Design | Build | Why |
| --- | --- | --- | --- |
| Header breakpoint | Follows the page: 1100 px on Home, How to play, Words, Guide; 1000 px elsewhere | The full bar from 1000 px on every English and Russian page, with tighter link padding up to 1200 px; from 1200 px on Armenian pages. From 1000 to 1199 px the bar's side padding follows the page gutter, so the wordmark lines up with the content | The bar is the same on every page. Armenian navigation labels are longer, and the full bar ran off the screen below about 1180 px, so Armenian keeps the menu button until 1200 px. Page content keeps its own breakpoints. |
| Header on narrow phones | 40 px language links beside the wordmark at every phone width | 44 px language links, an 8 px bar gap and no margin before the menu button; under 390 px the languages are in the menu sheet only | SPEC §10: touch targets at least 44 px. Three 44 px links and the menu button don't fit beside the wordmark under 390 px. |
| Big display headings (Home's final call, word band and answers) | Fixed sizes that run past their column in some languages: CHAMPIONS on wide screens, ՅՈՒՐԱՔԱՆՉՅՈՒՐ and ՊԱՏԱՍԽԱՆՆԵՐ in Armenian | The design's sizes, capped so the longest word fits its column (`.fit` in `styles/base.css`, with each word's width checked in `tests/e2e/layout.spec.ts`) | No text may overlap other text or widen the page (SPEC §10). Where the design's size fits, nothing changes. |
| Grids on phones | `1fr` columns | `minmax(0, 1fr)` | A long unbreakable word (an email address) could widen a `1fr` column past the screen. |
| Circle behind Home's feature screens | 340 px on phones | Up to 340 px, never wider than the screen | It widened 320 px pages by 10 px. |
| Footer and menu links | 40 px rows | 44 px rows | SPEC §10: touch targets at least 44 px. |
| Arrows after links (header, footer, menu sheet) | "→" in the interface font | A drawn arrow icon (`Icon.astro`), 1em, the text colour; 18 px with a 1.5 stroke in the menu sheet (the design's is 22 px) | No site font has "→" (U+2192), so the design's arrow was a system-font fallback; same reason as the "›" row under Copy. |
| Footer wordmark under 1310 px | 64 px from 1000 px | 64 px from 1310 px; from 1000 to 1309 px it scales down to its column | At full size it pushes the footer's columns into each other next to the longest Russian navigation label. |
| Menu sheet under 390 px | 65 px rows, 16 px pill padding | 56 px rows, 12 px pill padding | The languages live in the sheet under 390 px; this keeps the pills on one row and the store link on a 568 px-tall screen. |
| Menu close button | "×" in the system font at 24 px | A drawn close icon (`Icon.astro`), 20 px | Same reason as the arrows: the system "×" looks different on every system. |
| Footer email, 1000–1099 px | One line | Breaks after the @ | On one line it widened the page in Russian. |
| Mobile menu sheet | A JavaScript-driven overlay | The same sheet as a native popover | Opens, closes on Esc and works with JavaScript off; looks and animates the same. |

## Colour and contrast

| Where | Design | Build | Why |
| --- | --- | --- | --- |
| Chalk footer links ("Available on the App Store", hover colour) | `#0A7C39` on `#DEE5D5` | `#076B33` on `#DEE5D5` | `#0A7C39` on the footer's deeper chalk is 4.1:1, under WCAG AA's 4.5:1 for 15 px text. `#076B33` is 5.2:1 and still reads as the same grass green. Large display type keeps `#0A7C39`. |

## Copy

| Where | Design and copy deck | Build | Why |
| --- | --- | --- | --- |
| Menu paths in Support ("Settings → Report a bug", "Settings → Game reminders") | "→" in all three languages | "›" in English and Armenian; Russian says «открой «Настройки» и выбери «…»» | No site font has an arrow glyph, so "→" fell back to a system font. "›" is in the English and Armenian fonts and reads as a menu path, like the chevrons in iOS Settings. In Russian, "›" between «ёлочки» read as a stray quote mark, so the copy names the steps instead. |

## Home

| Where | Design | Build | Why |
| --- | --- | --- | --- |
| Match clock, how it counts | A JavaScript scroll handler, with the clock counting from the very top of the page | A CSS scroll timeline on each beat (`components/home/clock.css`), with the same mapping in `scripts/home.ts` only for browsers without scroll timelines. The clock starts counting as the first beat enters the screen, and reads each beat's stamp exactly as that beat reaches the middle | SPEC §9 prefers CSS scroll-driven animation, and the design notes ask for a scroll timeline. Anchoring to the beats keeps the stamps (01:00, 00:40, 00:07, 00:00) and the clock in agreement at every viewport height. |
| Clock turning red | A 300 ms colour transition | An instant switch at 10 seconds | The reading comes from a scroll-linked animation, and browsers don't run transitions on animated values. The red layer is a cross-faded copy, so only opacity changes. |
| Third beat's stamp on Russian pages | 00:07 | 00:08 | The Russian capture of the late card shows 00:08. Each stamp matches its real screen. |
| Inactive beat titles on wide screens | Opacity .32 | Opacity .42 | .32 gives 2.7:1 contrast, under WCAG's 3:1 for large text; .42 gives 3.6:1 and still recedes. |
| Clock pill | Hides once the last beat has passed | Also hides as soon as the lime word band reaches the bottom of the screen | The pill sat over the band's headline for a moment. |
| QR code | A hatched placeholder square | A real code, made at build time from the App Store link, dark on a light tile | Dark-on-light scans reliably on every phone camera. |
| Pinned screen with reduced motion | The prototype code kept the first screen | The screens still change with each beat, as a 150 ms cross-fade with no movement | The design's motion table specifies a cross-fade only, and each beat should show its own screen. |
| FAQ ("Quick answers") | `h3 > button[aria-expanded]`, opening by animating `grid-template-rows` | Native `<details>`/`<summary>`; the answer fades in with opacity and transform, one open at a time | `.claude/rules/performance.md` forbids animating layout properties, and answers must read with JavaScript off. The question isn't a heading inside the summary, which some screen readers mishandle. |
| Word wall | Words from the prototype's own list | The same words taken by index from the real Easy packs, so every language shows the game's own spelling | "Use the app's terms exactly." |
| Word wall without JavaScript | (not specified) | Still rows that scroll sideways, and no counter bar | Without JavaScript there's no Pause control, so nothing may move (WCAG 2.2.2), and scoring needs a script. |
| Pause control | `aria-pressed` with a changing label | A plain button whose label changes between Pause and Play | A toggle with `aria-pressed` must keep one label. |
| Whistle toggle | `aria-pressed` | A plain button whose visible label, "Whistle: off" or "Whistle: on", is its name; no `aria-pressed` | Same pattern as the Pause control: the state is said once, and the name is the visible label (WCAG 2.5.3). |
| Screenshot alt text | Two teams on the teams screen; "the winning team lifts the trophy" on the final screen | Three teams; "the winning team and the final score" | The captures show three teams and a champions screen, not a trophy lift. |
