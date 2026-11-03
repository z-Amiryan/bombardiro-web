import type { APIRoute } from 'astro';
import { favicon, icoFromPng, pngResponse } from '../lib/icons';

export const GET: APIRoute = async () => pngResponse(icoFromPng(await favicon(32), 32), 'image/x-icon');
