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
| Header breakpoint | Follows the page: 1100 px on Home, How to play, Words, Guide; 1000 px elsewhere | 1000 px on every page | The header's full navigation fits at 1000 px in all three languages, and one breakpoint keeps the header identical across pages. Page content keeps its own breakpoints. |
| Footer and menu links | 40 px rows | 44 px rows | SPEC §10: touch targets at least 44 px. |
| Mobile menu sheet | A JavaScript-driven overlay | The same sheet as a native popover | Opens, closes on Esc and works with JavaScript off; looks and animates the same. |

## Colour and contrast

| Where | Design | Build | Why |
| --- | --- | --- | --- |
| Chalk footer links ("Available on the App Store", hover colour) | `#0A7C39` on `#DEE5D5` | `#076B33` on `#DEE5D5` | `#0A7C39` on the footer's deeper chalk is 4.1:1, under WCAG AA's 4.5:1 for 15 px text. `#076B33` is 5.2:1 and still reads as the same grass green. Large display type keeps `#0A7C39`. |

## Copy

| Where | Design and copy deck | Build | Why |
| --- | --- | --- | --- |
| Menu paths in Support ("Settings → Report a bug", "Settings → Game reminders", all three languages) | "→" | "›" | No site font has an arrow glyph, so "→" fell back to a system font. "›" is in all three languages' fonts and reads as a menu path, like the chevrons in iOS Settings. |
