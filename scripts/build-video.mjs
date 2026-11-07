// Encodes the app preview for How to play (handoff/SPEC.md §8): H.264 at 660 px wide (twice the size it's
// shown at), at most 2.5 MB, with the index at the front so playback starts before the download ends. Also
// cuts the poster from the first frame, the app's own splash screen. Needs ffmpeg with libx264.
//
// The outputs are committed in public/video/, because the host's build has no ffmpeg. Run this again only
// when assets/video/ changes:
//   node scripts/build-video.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const source = join(root, 'assets/video/app-preview-en.mp4');
const outDir = join(root, 'public/video');
const video = join(outDir, 'app-preview-en.mp4');
const poster = join(outDir, 'app-preview-en.webp');
const MAX_BYTES = 2.5 * 1024 * 1024;
const WIDTH = 660;

mkdirSync(outDir, { recursive: true });

// prettier-ignore
execFileSync('ffmpeg', [
  '-v', 'error', '-y', '-i', source,
  '-vf', `scale=${WIDTH}:-2:flags=lanczos`,
  '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '21', '-maxrate', '1500k', '-bufsize', '3000k',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-c:a', 'aac', '-b:a', '48k', '-ac', '1',
  '-movflags', '+faststart', '-map_metadata', '-1',
  video,
]);

const size = statSync(video).size;
if (size > MAX_BYTES) throw new Error(`${video} is ${size} bytes, over the 2.5 MB budget`);

const tmp = mkdtempSync(join(tmpdir(), 'bb-poster-'));
try {
  const frame = join(tmp, 'frame.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', source, '-frames:v', '1', frame]);
  await sharp(frame).resize(WIDTH).webp({ quality: 72 }).toFile(poster);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const meta = await sharp(poster).metadata();
console.log(`${video}: ${(size / 1024).toFixed(0)} KB`);
console.log(`${poster}: ${meta.width}×${meta.height}, ${(statSync(poster).size / 1024).toFixed(1)} KB`);
