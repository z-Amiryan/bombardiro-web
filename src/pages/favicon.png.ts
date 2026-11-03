import type { APIRoute } from 'astro';
import { favicon, pngResponse } from '../lib/icons';

export const GET: APIRoute = async () => pngResponse(await favicon(48));
