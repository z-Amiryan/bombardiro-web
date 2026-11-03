#!/usr/bin/env python3
"""Font assets that keep each language's pages on that language's own fonts (handoff/SPEC.md §8).

1. Outlines (src/assets/generated/outlines.json): the display words the design sets in another language's
   typeface on every page, as SVG paths, so no page loads a font only for them. The BOMBARDIRO wordmark
   (Archivo 900 italic) and «БОМБАРДИР» (Noto Sans 900 italic, About page). Shaped with HarfBuzz (kerning,
   the 900 instance of the variable font) from the same WOFF2 files the site serves, with the design's
   letter-spacing.
2. Foreign-glyph subsets (src/assets/fonts/foreign-{lang}-{script}.woff2): each language's copy names the
   other languages in their own script (the language switcher) and quotes «бомбардир». These subsets carry
   only those glyphs, from Noto Sans and Noto Sans Armenian, so the words render in a designed face instead
   of a system fallback. The browser fetches one only on a page that shows those characters.

Run it when the wordmark, the fonts or the copy's foreign words change. The font-coverage unit test fails
when a subset is missing a character.
    python3 -m pip install -r scripts/requirements-fonts.txt
    python3 scripts/build-font-assets.py
"""
import io
import json
import re
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'node_modules' / '@fontsource-variable'
OUT = ROOT / 'src' / 'assets' / 'generated' / 'outlines.json'
SUBSETS = ROOT / 'src' / 'assets' / 'fonts'
SCRIPTS = {
    'cyrillic': (re.compile(r'[\u0400-\u04FF]'), FONTS / 'noto-sans' / 'files' / 'noto-sans-cyrillic-wght-normal.woff2'),
    'armenian': (re.compile(r'[\u0530-\u058F\uFB13-\uFB17]'), FONTS / 'noto-sans-armenian' / 'files' / 'noto-sans-armenian-armenian-wght-normal.woff2'),
}
# The script each language's own fonts already cover.
OWN = {'en': None, 'ru': 'cyrillic', 'hy': 'armenian'}


def load(woff2: Path):
    font = TTFont(str(woff2))
    font.flavor = None
    data = io.BytesIO()
    font.save(data)
    face = hb.Face(hb.Blob(data.getvalue()))
    hb_font = hb.Font(face)
    return hb_font, face.upem


class _Recorder:
    """Pen adapter: HarfBuzz draws into it, it forwards to a fontTools pen."""

    def __init__(self, pen):
        self.pen = pen

    def moveTo(self, p):
        self.pen.moveTo(p)

    def lineTo(self, p):
        self.pen.lineTo(p)

    def curveTo(self, *pts):
        self.pen.curveTo(*pts)

    def qCurveTo(self, *pts):
        self.pen.qCurveTo(*pts)

    def closePath(self):
        self.pen.closePath()

    def endPath(self):
        self.pen.endPath()


def outline(woff2: Path, parts, letter_spacing_em: float, weight: int):
    """Shapes the concatenated parts and returns one SVG path per part, in font units, y pointing down."""
    font, upem = load(woff2)
    font.set_variations({'wght': weight})
    text = ''.join(parts)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': False})
    spacing = letter_spacing_em * upem

    x = 0.0
    placed = []  # (cluster, gid, x, y)
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        placed.append((info.cluster, info.codepoint, x + pos.x_offset, pos.y_offset))
        x += pos.x_advance + spacing

    # Bounds over everything, to build a tight viewBox.
    bounds = BoundsPen(None)
    for _, gid, gx, gy in placed:
        font.draw_glyph_with_pen(gid, _Recorder(TransformPen(bounds, (1, 0, 0, -1, gx, -gy))))
    x_min, y_min, x_max, y_max = bounds.bounds

    out = []
    start = 0
    for part in parts:
        end = start + len(part)
        pen = SVGPathPen(None, ntos=lambda v: str(int(round(v))))
        for cluster, gid, gx, gy in placed:
            if start <= cluster < end:
                font.draw_glyph_with_pen(gid, _Recorder(TransformPen(pen, (1, 0, 0, -1, gx - x_min, -gy - y_min))))
        out.append({'text': part, 'd': pen.getCommands()})
        start = end

    width, height = x_max - x_min, y_max - y_min
    return {
        'viewBox': f'0 0 {round(width, 1)} {round(height, 1)}',
        # Size relative to the font size the design sets the word in, so the SVG can stand in for the text.
        'widthEm': round(width / upem, 4),
        'heightEm': round(height / upem, 4),
        'parts': out,
    }


def site_text(lang: str) -> str:
    """Everything a language's pages say: its copy file and its guides."""
    text = (ROOT / 'content' / 'copy' / f'{lang}.json').read_text(encoding='utf-8')
    guides = ROOT / 'src' / 'content' / 'guides' / lang
    if guides.is_dir():
        text += ''.join(p.read_text(encoding='utf-8') for p in sorted(guides.glob('*.md')))
    return text


def build_subsets():
    SUBSETS.mkdir(parents=True, exist_ok=True)
    for lang, own in OWN.items():
        text = site_text(lang)
        for script, (pattern, source) in SCRIPTS.items():
            if script == own:
                continue
            chars = sorted(set(pattern.findall(text)))
            target = SUBSETS / f'foreign-{lang}-{script}.woff2'
            if not chars:
                target.unlink(missing_ok=True)
                continue
            # Both cases, in case a word is set in capitals.
            chars = sorted(set(chars) | {c.upper() for c in chars} | {c.lower() for c in chars})
            options = subset.Options()
            options.flavor = 'woff2'
            options.layout_features = ['kern', 'mark', 'mkmk', 'ccmp', 'locl']
            options.hinting = False
            options.name_IDs = [1, 2, 3, 4, 5, 6]
            options.notdef_outline = False
            font = subset.load_font(str(source), options)
            subsetter = subset.Subsetter(options)
            subsetter.populate(text=''.join(chars))
            subsetter.subset(font)
            subset.save_font(font, str(target), options)
            print(f'{target.relative_to(ROOT)}: {"".join(chars)} ({target.stat().st_size} bytes)')


def main():
    archivo = FONTS / 'archivo' / 'files' / 'archivo-latin-wght-italic.woff2'
    noto_italic_cyr = FONTS / 'noto-sans' / 'files' / 'noto-sans-cyrillic-wght-italic.woff2'
    data = {
        # Header, menu sheet, print sheet and guide card: letter-spacing -.015em.
        'wordmark': outline(archivo, ['BOMBAR', 'DIRO'], -0.015, 900),
        # Footer: the large wordmark is set tighter, at -.03em.
        'wordmarkTight': outline(archivo, ['BOMBAR', 'DIRO'], -0.03, 900),
        # About: «бомбардир», uppercase, -.03em.
        'bombardir': outline(noto_italic_cyr, ['БОМБАРДИР'], -0.03, 900),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for key, value in data.items():
        size = sum(len(p['d']) for p in value['parts'])
        print(f'{key}: viewBox {value["viewBox"]}, {size} bytes of path data')
    build_subsets()


if __name__ == '__main__':
    main()
