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

## Layout and components

| Where | Design | Build | Why |
| --- | --- | --- | --- |
| Header breakpoint | Follows the page: 1100 px on Home, How to play, Words, Guide; 1000 px elsewhere | The full bar from 1000 px on every English and Russian page, with tighter link padding up to 1200 px; from 1200 px on Armenian pages. From 1000 to 1199 px the bar's side padding follows the page gutter, so the wordmark lines up with the content | The bar is the same on every page. Armenian navigation labels are longer, and the full bar ran off the screen below about 1180 px, so Armenian keeps the menu button until 1200 px. Page content keeps its own breakpoints. |
| Header on narrow phones | 40 px language links beside the wordmark at every phone width | 44 px language links; under 390 px the languages are in the menu sheet only | SPEC §10: touch targets at least 44 px. Three 44 px links and the menu button don't fit beside the wordmark under 390 px. |
| Grids on phones | `1fr` columns | `minmax(0, 1fr)` | A long unbreakable word (an email address) could widen a `1fr` column past the screen. |
| Footer and menu links | 40 px rows | 44 px rows | SPEC §10: touch targets at least 44 px. |
| Arrows after links (header, footer, menu sheet) | "→" in the interface font | A drawn arrow icon (`Icon.astro`), 1em, the text colour | No site font has "→" (U+2192), so the design's arrow was a system-font fallback; same reason as the "›" row under Copy. |
| Footer wordmark under 1310 px | 64 px from 1000 px | 64 px from 1310 px; from 1000 to 1309 px it scales down to its column | At full size it pushes the footer's columns into each other next to the longest Russian navigation label. |
| Mobile menu sheet | A JavaScript-driven overlay | The same sheet as a native popover | Opens, closes on Esc and works with JavaScript off; looks and animates the same. |

## Colour and contrast

| Where | Design | Build | Why |
| --- | --- | --- | --- |
| Chalk footer links ("Available on the App Store", hover colour) | `#0A7C39` on `#DEE5D5` | `#076B33` on `#DEE5D5` | `#0A7C39` on the footer's deeper chalk is 4.1:1, under WCAG AA's 4.5:1 for 15 px text. `#076B33` is 5.2:1 and still reads as the same grass green. Large display type keeps `#0A7C39`. |

## Copy

| Where | Design and copy deck | Build | Why |
| --- | --- | --- | --- |
| Menu paths in Support ("Settings → Report a bug", "Settings → Game reminders") | "→" in all three languages | "›" in English and Armenian; Russian says «открой «Настройки» и выбери «…»» | No site font has an arrow glyph, so "→" fell back to a system font. "›" is in the English and Armenian fonts and reads as a menu path, like the chevrons in iOS Settings. In Russian, "›" between «ёлочки» read as a stray quote mark, so the copy names the steps instead. |
