import type { APIRoute } from 'astro';
import { appIcon, pngResponse } from '../lib/icons';

// The logo in Organization structured data, and the app's image.
export const GET: APIRoute = async () => pngResponse(await appIcon(512));
