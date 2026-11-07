// The press kit (handoff/SPEC.md §8): the app icon, the wordmark as outlined SVG made from Archivo, and six
// real iPhone screenshots each in English and Russian. Built as a zip at build time from the files already in
// assets/, so the repository keeps one copy of each. PNGs are already compressed, so entries are stored as is.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { crc32 } from 'node:zlib';
import outlines from '../assets/generated/outlines.json' with { type: 'json' };
import { LAST_UPDATED } from '../config/site';
import { SCREENS } from './screens';

export const PRESS_KIT_PATH = '/press/bombardiro-press-kit.zip';

const KIT_SCREENS = ['liveCard', 'categories', 'teams', 'scoreboard', 'final', 'languages'] as const;

/** The wordmark in the site's two looks: Night (ink and lime) and Chalk (ink and grass), as in tokens.css. */
const WORDMARK_COLOURS = {
  'on-dark': ['#edf3e6', '#bff747'],
  'on-light': ['#12180f', '#0e9c49'],
} as const;

function wordmarkSvg([a, b]: readonly [string, string]): string {
  const { viewBox, parts } = outlines.wordmark;
  const [bombar, diro] = parts;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`,
    `<title>Bombardiro</title>`,
    `<path fill="${a}" d="${bombar?.d ?? ''}"/>`,
    `<path fill="${b}" d="${diro?.d ?? ''}"/>`,
    `</svg>`,
    '',
  ].join('\n');
}

export function pressKitFiles(): Array<{ name: string; data: Buffer }> {
  const root = process.cwd();
  const files = [
    { name: 'bombardiro-icon.png', data: readFileSync(join(root, 'assets/brand/icon.png')) },
    ...Object.entries(WORDMARK_COLOURS).map(([look, colours]) => ({
      name: `bombardiro-wordmark-${look}.svg`,
      data: Buffer.from(wordmarkSvg(colours), 'utf8'),
    })),
  ];
  for (const lang of ['en', 'ru'] as const) {
    for (const id of KIT_SCREENS) {
      const file = `${SCREENS[id]}.png`;
      files.push({ name: `screenshots/${lang}/${file}`, data: readFileSync(join(root, 'assets/screenshots', lang, 'iphone', file)) });
    }
  }
  return files;
}

/** A zip archive with every entry stored (no compression), dated LAST_UPDATED, so a build is reproducible. */
export function zip(files: Array<{ name: string; data: Buffer }>): Buffer {
  const [year = 2026, month = 1, day = 1] = LAST_UPDATED.split('-').map(Number);
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const { name, data } of files) {
    const nameBytes = Buffer.from(name, 'utf8');
    const crc = crc32(data);
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0);
    head.writeUInt16LE(20, 4); // version needed
    head.writeUInt16LE(0x0800, 6); // UTF-8 names
    head.writeUInt16LE(0, 8); // stored
    head.writeUInt16LE(0, 10); // time
    head.writeUInt16LE(dosDate, 12);
    head.writeUInt32LE(crc, 14);
    head.writeUInt32LE(data.length, 18);
    head.writeUInt32LE(data.length, 22);
    head.writeUInt16LE(nameBytes.length, 26);
    head.writeUInt16LE(0, 28);
    local.push(head, nameBytes, data);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4); // version made by
    entry.writeUInt16LE(20, 6); // version needed
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(0, 10);
    entry.writeUInt16LE(0, 12);
    entry.writeUInt16LE(dosDate, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBytes.length, 28);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBytes);
    offset += head.length + nameBytes.length + data.length;
  }
  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}
