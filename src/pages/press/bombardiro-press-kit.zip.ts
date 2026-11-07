import type { APIRoute } from 'astro';
import { pressKitFiles, zip } from '../../lib/press-kit';

// The press kit for About (src/lib/press-kit.ts), made at build time from assets/.
export const GET: APIRoute = () =>
  new Response(new Uint8Array(zip(pressKitFiles())), { headers: { 'Content-Type': 'application/zip' } });
