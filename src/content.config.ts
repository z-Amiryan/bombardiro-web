// Guides (handoff/guide-briefs.md): one YAML file per guide and language, in src/content/guides/{lang}/. The
// structure follows the article design (design/export/Guide.dc.html): numbered sections with paragraphs, a
// numbered list, a note, a comparison table, facts, or glossary terms. Text may link to a page with
// [words](routeId) or [words](routeId#fragment), resolved from handoff/routes.json.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { GUIDE_ROUTE_IDS, LANGS } from './lib/routes';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const paragraphs = z.array(z.string()).optional();

/** One glossary entry: the term in each language, exactly as in the Tactics & Trophies pack at that index. */
const term = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  level: z.enum(['easy', 'hard']),
  index: z.number().int().min(0),
  ru: z.string(),
  en: z.string(),
  hy: z.string(),
  def: z.string(),
});

const section = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  h: z.string(),
  /** A label beside the heading, such as "House rules". */
  house: z.string().optional(),
  /** Paragraphs before the list. */
  p: paragraphs,
  /** A numbered list. */
  list: paragraphs,
  /** Paragraphs after the list. */
  after: paragraphs,
  /** Short label and value pairs, such as "Players: 4+". */
  facts: z.array(z.tuple([z.string(), z.string()])).optional(),
  note: z.string().optional(),
  compare: z.object({ cols: z.tuple([z.string(), z.string(), z.string()]), rows: z.array(z.tuple([z.string(), z.string(), z.string()])) }).optional(),
  terms: z.array(term).optional(),
  /** Show the Bombardiro card (badge, How to play link) after this section. Once per guide. */
  app: z.boolean().optional(),
});

const guides = defineCollection({
  loader: glob({ pattern: '*/*.yaml', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().min(70).max(160),
    routeId: z.enum(GUIDE_ROUTE_IDS as [string, ...string[]]),
    lang: z.enum(LANGS),
    /** The small label above the title on the hub card and the article, e.g. "Rules". */
    kicker: z.string(),
    datePublished: isoDate,
    dateModified: isoDate,
    /** The answer to the search, in the first 60 words (handoff/guide-briefs.md). */
    short: z.string(),
    /** Column heads for glossary tables. */
    termHeads: z.tuple([z.string(), z.string(), z.string(), z.string()]).optional(),
    sections: z.array(section).min(3),
  }),
});

export const collections = { guides };
