// Words in another script inside a page's text carry their own lang (handoff/SPEC.md §10), so screen readers
// pronounce them right and the language check passes: «бомбардир» on English pages, for example.
import type { Lang } from './routes';

const SCRIPTS: Array<{ lang: Lang; run: RegExp }> = [
  { lang: 'ru', run: /[Ѐ-ӿ]+(?:[\s-]+[Ѐ-ӿ]+)*/gu },
  { lang: 'hy', run: /[԰-֏ﬓ-ﬗ]+(?:[\s-]+[԰-֏ﬓ-ﬗ]+)*/gu },
];

export interface Segment {
  text: string;
  lang?: Lang;
}

/** Splits `text` into runs, marking each run written in another language's script with that language. */
export function foreignRuns(text: string, pageLang: Lang): Segment[] {
  const marks: Array<{ start: number; end: number; lang: Lang }> = [];
  for (const { lang, run } of SCRIPTS) {
    if (lang === pageLang) continue;
    for (const m of text.matchAll(run)) marks.push({ start: m.index, end: m.index + m[0].length, lang });
  }
  marks.sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let at = 0;
  for (const { start, end, lang } of marks) {
    if (start > at) out.push({ text: text.slice(at, start) });
    out.push({ text: text.slice(start, end), lang });
    at = end;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}
