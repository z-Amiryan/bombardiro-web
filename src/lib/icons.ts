// Icons cut from assets/brand/ at build time, so the repository keeps one source for each.
import { join } from 'node:path';
import sharp from 'sharp';
import { THEME_COLOR } from './surface';

const brand = (file: string) => join(process.cwd(), 'assets/brand', file);

export function pngResponse(body: Buffer, type = 'image/png'): Response {
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': type } });
}

/** The app icon at a square size, opaque, as PNG. */
export function appIcon(size: number): Promise<Buffer> {
  return sharp(brand('icon.png')).resize(size, size).flatten({ background: THEME_COLOR.night }).png({ compressionLevel: 9 }).toBuffer();
}

export function favicon(size: number): Promise<Buffer> {
  return sharp(brand('favicon.png')).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

/** An .ico file that wraps one PNG image, which every browser that asks for /favicon.ico understands. */
export function icoFromPng(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size >= 256 ? 0 : size, 6);
  header.writeUInt8(size >= 256 ? 0 : size, 7);
  header.writeUInt8(0, 8); // no palette
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // image data offset
  return Buffer.concat([header, png]);
}
