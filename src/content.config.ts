// Guides (handoff/guide-briefs.md): one Markdown file per guide and language, in src/content/guides/{lang}/.
// The route id ties each file to its URL in handoff/routes.json.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { GUIDE_ROUTE_IDS, LANGS } from './lib/routes';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const guides = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().min(70).max(160),
    routeId: z.enum(GUIDE_ROUTE_IDS as [string, ...string[]]),
    lang: z.enum(LANGS),
    /** The small label above the title on the hub card and the article, e.g. "Rules". */
    kicker: z.string(),
    datePublished: isoDate,
    dateModified: isoDate,
  }),
});

export const collections = { guides };
