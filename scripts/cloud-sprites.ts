/**
 * Builds the sky's cloud sprites from the original Urban Dreams cloud (media-src/base_cloud.png).
 *
 *   node scripts/cloud-sprites.ts
 *
 * 1. Cleans it: lifts the dark mottling so the body reads as soft white-grey instead of smog, and
 *    removes the small dark specks on its fringe.
 * 2. Derives two more silhouettes from it (a long cumulus bank, a tall puffy stack) so the sky
 *    never shows the same shape in rows.
 *
 * Writes public/media/clouds/cloud-{a,b,c}.webp.
 */
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'media-src/base_cloud.png');
const OUT = path.join(ROOT, 'public/media/clouds');

/** How much of the original darkness survives (0 = flat white, 1 = untouched). */
const DARK_KEEP = 0.42;
/** Faint, dark pixels on the fringe are specks, not cloud. */
const SPECK_ALPHA = 70;
const SPECK_LUMA = 120;

async function clean(): Promise<Buffer> {
  const { data, info } = await sharp(SRC).resize({ width: 800 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    const lifted = Math.round(255 - (255 - luma) * DARK_KEEP);
    data[i] = data[i + 1] = data[i + 2] = lifted; // neutral grey-white, no colour cast
    if (data[i + 3]! < SPECK_ALPHA && luma < SPECK_LUMA) data[i + 3] = Math.round(data[i + 3]! * 0.12);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function scaled(input: Buffer, factor: number, flop = false) {
  const meta = await sharp(input).metadata();
  let img = sharp(input).resize({ width: Math.round(meta.width! * factor) });
  if (flop) img = img.flop();
  return img.png().toBuffer();
}

async function canvas(width: number, height: number, layers: Array<{ input: Buffer; left: number; top: number }>) {
  return sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers)
    .png()
    .toBuffer();
}

async function write(name: string, input: Buffer) {
  const file = path.join(OUT, `${name}.webp`);
  const info = await sharp(input).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(file);
  console.log(`✓ ${path.relative(ROOT, file)}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}

const a = await clean();

// B: a long, low cumulus bank: two copies side by side, the second mirrored and a little lower
const b = await canvas(1060, 540, [
  { input: await scaled(a, 0.82), left: 0, top: 30 },
  { input: await scaled(a, 0.9, true), left: 300, top: 60 },
]);

// C: a tall, puffy stack: a wide base with a smaller crown on top
const c = await canvas(780, 580, [
  { input: await scaled(a, 0.66, true), left: 170, top: 0 },
  { input: await scaled(a, 0.92), left: 20, top: 66 },
]);

await write('cloud-a', a);
await write('cloud-b', b);
await write('cloud-c', c);
