import type { APIRoute } from 'astro';
import { appIcon, pngResponse } from '../lib/icons';

// 180 × 180, no transparency (DESIGN-NOTES.md).
export const GET: APIRoute = async () => pngResponse(await appIcon(180));
