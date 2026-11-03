import type { APIRoute } from 'astro';
import { SITE_URL } from '../config/site';

// Every crawler, including AI crawlers, may read every page. Preview hosts are kept out of indexes by the
// X-Robots-Tag header in vercel.json, not here.
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
