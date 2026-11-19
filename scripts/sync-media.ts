/**
 * Media pipeline for Urban Dreams.
 *
 *   node scripts/sync-media.ts                 # all works + brand assets (incremental)
 *   node scripts/sync-media.ts --force         # regenerate everything
 *   node scripts/sync-media.ts --only <slug>   # one work (repeatable / comma-separated)
 *   node scripts/sync-media.ts --brand         # brand assets only (cloud, favicon, og)
 *   node scripts/sync-media.ts --seed <path>   # seed the cache from local copies first
 *
 * --seed accepts either a directory (files are matched to works by exact byte size
 * against the gateway's Content-Length) or a JSON manifest `{ "<slug>": "<path>" }`.
 * Seed files are copied, never moved.
 *
 * Originals live in .media-cache/originals/<cid> (gitignored) and are fetched
 * sequentially from the Filebase IPFS gateway when missing.
 */
import { copyFile, mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import type { Sharp } from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES_FILE = path.join(ROOT, 'scripts/media-sources.json');
const WORKS_DIR = path.join(ROOT, 'content/works');
const CACHE_DIR = path.join(ROOT, '.media-cache/originals');
const OUT_DIR = path.join(ROOT, 'public/media/works');
const MEDIA_JSON = path.join(ROOT, 'content/media.json');
const PUBLIC_DIR = path.join(ROOT, 'public');

const GATEWAY = 'https://ipfs.filebase.io/ipfs/';
const FETCH_TIMEOUT_MS = 180_000;
const FETCH_RETRIES = 5;

/** Output tuning. All originals are 3:4 portrait, so these are effectively heights. */
// effort 6 was measured ~8x slower than 4 for only ~4% smaller files; quality 50 keeps
// the full set around 27 MB (typical work 0.5-1.8 MB; the noisy matrix-glitch ~3 MB).
const FULL = { maxSide: 960, quality: 50, effort: 4 };
const POSTER = { maxSide: 640, quality: 78, minQuality: 54, maxBytes: 80 * 1024, effort: 6 };
const THUMB = { size: 96, quality: 76, effort: 6 };

type Source = { slug: string; cid: string };
type MediaEntry = {
  width: number;
  height: number;
  frames: number;
  bytes: { full: number; poster: number; thumb: number };
};

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2);
const flags = {
  force: argv.includes('--force'),
  brand: argv.includes('--brand'),
  only: [] as string[],
  seed: undefined as string | undefined,
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i] ?? '';
  if (a === '--only') flags.only.push(...(argv[++i] ?? '').split(',').filter(Boolean));
  else if (a.startsWith('--only=')) flags.only.push(...a.slice(7).split(',').filter(Boolean));
  else if (a === '--seed') flags.seed = argv[++i];
  else if (a.startsWith('--seed=')) flags.seed = a.slice(7);
  else if (a === '--force' || a === '--brand') continue;
  else if (a === '--help' || a === '-h') {
    console.log('Usage: node scripts/sync-media.ts [--force] [--only <slug>] [--brand] [--seed <dir|manifest.json>]');
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${a}`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------- helpers

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

function mtime(p: string): number {
  try {
    return statSync(p).mtimeMs;
  } catch {
    return 0;
  }
}

/** Outputs are fresh when they all exist and are newer than every input. */
function isFresh(outputs: string[], inputs: string[]): boolean {
  const newestInput = Math.max(...inputs.map(mtime));
  return outputs.every((o) => existsSync(o) && mtime(o) > newestInput);
}

function sniff(buf: Uint8Array): 'gif' | 'png' | 'jpeg' | 'webp' | null {
  const b = Buffer.from(buf.buffer, buf.byteOffset, Math.min(buf.byteLength, 16));
  if (b.subarray(0, 6).toString('latin1') === 'GIF87a' || b.subarray(0, 6).toString('latin1') === 'GIF89a') return 'gif';
  if (b[0] === 0x89 && b.subarray(1, 4).toString('latin1') === 'PNG') return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

async function sniffFile(p: string) {
  const fh = await readFile(p).catch(() => null);
  return fh ? sniff(fh) : null;
}

async function headLength(cid: string): Promise<number | null> {
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(GATEWAY + cid, { method: 'HEAD', signal: AbortSignal.timeout(30_000) });
      if (res.ok) {
        const len = Number(res.headers.get('content-length'));
        return Number.isFinite(len) && len > 0 ? len : null;
      }
      if (res.status !== 429 && res.status < 500) return null;
    } catch {
      /* retry */
    }
    await sleep(1000 * 2 ** attempt);
  }
  return null;
}

async function download(src: Source, dest: string): Promise<void> {
  const url = GATEWAY + src.cid;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const t0 = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const ctype = res.headers.get('content-type') ?? '';
      if (ctype.includes('text/html')) throw new Error(`gateway returned HTML (${ctype})`);
      const buf = new Uint8Array(await res.arrayBuffer());
      const expected = Number(res.headers.get('content-length'));
      if (expected && buf.byteLength !== expected) throw new Error(`truncated: ${buf.byteLength}/${expected} bytes`);
      const kind = sniff(buf);
      if (!kind) throw new Error(`not an image (first bytes: ${Buffer.from(buf.subarray(0, 12)).toString('hex')})`);
      const tmp = `${dest}.part`;
      await writeFile(tmp, buf);
      await rename(tmp, dest);
      console.log(`  ↓ ${src.slug}: ${mb(buf.byteLength)} ${kind} in ${secs(Date.now() - t0)}`);
      return;
    } catch (err) {
      lastErr = err;
      const wait = Math.min(60_000, 2000 * 2 ** (attempt - 1));
      console.warn(`  ! ${src.slug}: attempt ${attempt}/${FETCH_RETRIES} failed (${(err as Error).message}); retry in ${secs(wait)}`);
      if (attempt < FETCH_RETRIES) await sleep(wait);
    }
  }
  throw new Error(`download failed for ${src.slug} (${src.cid}): ${(lastErr as Error)?.message}`);
}

// ---------------------------------------------------------------- seeding

async function seed(sources: Source[], seedPath: string) {
  console.log(`Seeding cache from ${seedPath}`);
  const info = await stat(seedPath);
  const pairs: Array<{ src: Source; file: string }> = [];
  if (info.isDirectory()) {
    // Match by exact byte size against the gateway's Content-Length.
    const bySize = new Map<number, string>();
    const walk = async (dir: string) => {
      for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) await walk(p);
        else if (/\.(gif|png|jpe?g|webp)$/i.test(e.name)) bySize.set((await stat(p)).size, p);
      }
    };
    await walk(seedPath);
    for (const src of sources) {
      if (existsSync(path.join(CACHE_DIR, src.cid))) continue;
      const len = await headLength(src.cid);
      const file = len ? bySize.get(len) : undefined;
      if (file) pairs.push({ src, file });
    }
  } else {
    const manifest = JSON.parse(await readFile(seedPath, 'utf8')) as Record<string, string>;
    for (const src of sources) {
      const file = manifest[src.slug];
      if (file && !existsSync(path.join(CACHE_DIR, src.cid))) pairs.push({ src, file: path.resolve(path.dirname(seedPath), file) });
    }
  }
  for (const { src, file } of pairs) {
    if (!(await sniffFile(file))) {
      console.warn(`  ! ${src.slug}: seed ${file} is not a recognised image, skipped`);
      continue;
    }
    await copyFile(file, path.join(CACHE_DIR, src.cid));
    console.log(`  ⧉ ${src.slug} ← ${file}`);
  }
  console.log(`  seeded ${pairs.length} file(s)\n`);
}

// ---------------------------------------------------------------- works

function outPaths(slug: string) {
  return {
    full: path.join(OUT_DIR, `${slug}.webp`),
    poster: path.join(OUT_DIR, `${slug}.poster.webp`),
    thumb: path.join(OUT_DIR, `${slug}.thumb.webp`),
  };
}

async function ensureOriginal(src: Source): Promise<string> {
  const p = path.join(CACHE_DIR, src.cid);
  if (existsSync(p)) {
    if (await sniffFile(p)) return p;
    console.warn(`  ! ${src.slug}: cached file is invalid, re-downloading`);
    await unlink(p);
  }
  await download(src, p);
  return p;
}

async function processWork(src: Source, original: string): Promise<'built' | 'skipped'> {
  const out = outPaths(src.slug);
  if (!flags.force && isFresh(Object.values(out), [original, fileURLToPath(import.meta.url)])) return 'skipped';

  const t0 = Date.now();
  const meta = await sharp(original, { animated: true, limitInputPixels: false }).metadata();
  const animated = (meta.pages ?? 1) > 1;

  const fullPipe = sharp(original, { animated, limitInputPixels: false })
    .resize({ width: FULL.maxSide, height: FULL.maxSide, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: FULL.quality, effort: FULL.effort, smartSubsample: true, ...(animated ? { loop: 0 } : {}) });
  await fullPipe.toFile(`${out.full}.tmp`);
  await rename(`${out.full}.tmp`, out.full);

  // First frame only (sharp reads page 0 by default).
  // Step quality down until the poster fits the budget (noisy works need it).
  const posterBase = await sharp(original, { limitInputPixels: false })
    .resize({ width: POSTER.maxSide, height: POSTER.maxSide, fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  let posterBuf: Buffer = Buffer.alloc(0);
  for (let q = POSTER.quality; q >= POSTER.minQuality; q -= 6) {
    posterBuf = await sharp(posterBase).webp({ quality: q, effort: POSTER.effort, smartSubsample: true }).toBuffer();
    if (posterBuf.byteLength <= POSTER.maxBytes) break;
  }
  await writeFile(out.poster, posterBuf);

  await sharp(original, { limitInputPixels: false })
    .resize(THUMB.size, THUMB.size, { fit: 'cover', position: 'centre' })
    .webp({ quality: THUMB.quality, effort: THUMB.effort })
    .toFile(out.thumb);

  console.log(`  ✓ ${src.slug.padEnd(30)} ${secs(Date.now() - t0)}`);
  return 'built';
}

async function describe(slug: string): Promise<MediaEntry> {
  const out = outPaths(slug);
  const m = await sharp(out.full, { animated: true }).metadata();
  return {
    width: m.width,
    height: m.pageHeight ?? m.height,
    frames: m.pages ?? 1,
    bytes: {
      full: (await stat(out.full)).size,
      poster: (await stat(out.poster)).size,
      thumb: (await stat(out.thumb)).size,
    },
  };
}

async function loadWorkOrder(): Promise<Map<string, number>> {
  const order = new Map<string, number>();
  for (const f of (await readdir(WORKS_DIR)).filter((f) => f.endsWith('.json'))) {
    const w = JSON.parse(await readFile(path.join(WORKS_DIR, f), 'utf8')) as { id: number; slug: string };
    order.set(w.slug, w.id);
  }
  return order;
}

async function syncWorks(): Promise<boolean> {
  const sources = JSON.parse(await readFile(SOURCES_FILE, 'utf8')) as Source[];
  const order = await loadWorkOrder();
  const unknown = flags.only.filter((s) => !sources.some((x) => x.slug === s));
  if (unknown.length) throw new Error(`--only: unknown slug(s): ${unknown.join(', ')}`);
  const missingMeta = sources.filter((s) => !order.has(s.slug)).map((s) => s.slug);
  if (missingMeta.length) console.warn(`! no content/works entry for: ${missingMeta.join(', ')}`);

  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });
  if (flags.seed) await seed(sources, flags.seed);

  const selected = flags.only.length ? sources.filter((s) => flags.only.includes(s.slug)) : sources;
  console.log(`Works: ${selected.length} selected${flags.force ? ' (forced)' : ''}`);
  const failures: string[] = [];
  let built = 0;
  let skipped = 0;
  for (const src of selected) {
    try {
      const original = await ensureOriginal(src);
      if ((await processWork(src, original)) === 'built') built++;
      else skipped++;
    } catch (err) {
      failures.push(src.slug);
      console.error(`  ✗ ${src.slug}: ${(err as Error).message}`);
    }
  }
  console.log(`  built ${built}, up to date ${skipped}, failed ${failures.length}\n`);

  // Rebuild media.json from whatever outputs exist, in id order.
  const media: Record<string, MediaEntry> = {};
  const sorted = [...sources].sort((a, b) => (order.get(a.slug) ?? 1e9) - (order.get(b.slug) ?? 1e9));
  const rows: Array<[string, MediaEntry]> = [];
  for (const src of sorted) {
    const out = outPaths(src.slug);
    if (!Object.values(out).every((p) => existsSync(p))) {
      if (selected.includes(src) && !failures.includes(src.slug)) failures.push(src.slug);
      else if (!selected.includes(src)) console.warn(`! ${src.slug}: outputs missing (not selected), omitted from media.json`);
      continue;
    }
    const entry = await describe(src.slug);
    media[src.slug] = entry;
    rows.push([src.slug, entry]);
  }
  await writeFile(MEDIA_JSON, JSON.stringify(media, null, 2) + '\n');

  // Size table
  const tot = { full: 0, poster: 0, thumb: 0 };
  console.log(`${'slug'.padEnd(30)} ${'size'.padEnd(9)} ${'fr'.padStart(3)} ${'full'.padStart(9)} ${'poster'.padStart(8)} ${'thumb'.padStart(7)}`);
  for (const [slug, e] of rows) {
    tot.full += e.bytes.full;
    tot.poster += e.bytes.poster;
    tot.thumb += e.bytes.thumb;
    console.log(
      `${slug.padEnd(30)} ${`${e.width}x${e.height}`.padEnd(9)} ${String(e.frames).padStart(3)} ${kb(e.bytes.full).padStart(9)} ${kb(e.bytes.poster).padStart(8)} ${kb(e.bytes.thumb).padStart(7)}`,
    );
  }
  console.log(
    `${'TOTAL'.padEnd(30)} ${''.padEnd(9)} ${''.padStart(3)} ${mb(tot.full).padStart(9)} ${kb(tot.poster).padStart(8)} ${kb(tot.thumb).padStart(7)}  = ${mb(tot.full + tot.poster + tot.thumb)}`,
  );
  console.log(`\nWrote ${path.relative(ROOT, MEDIA_JSON)} (${rows.length} entries)`);

  if (failures.length) {
    console.error(`\nFAILED: ${failures.join(', ')}`);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- brand

async function syncBrand(): Promise<boolean> {
  const self = fileURLToPath(import.meta.url);
  const jobs: Array<{ input: string; output: string; run: (input: string) => Sharp }> = [
    {
      input: 'base_cloud.png',
      output: 'media/cloud.webp',
      run: (i) =>
        sharp(i).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80, alphaQuality: 90, effort: 6 }),
    },
    {
      input: 'logo.png',
      output: 'favicon-32.png',
      run: (i) => sharp(i).resize(32, 32, { fit: 'cover' }).png({ compressionLevel: 9, palette: true }),
    },
    {
      input: 'logo.png',
      output: 'apple-touch-icon.png',
      run: (i) => sharp(i).resize(180, 180, { fit: 'cover' }).flatten({ background: '#000000' }).png({ compressionLevel: 9 }),
    },
    {
      input: 'banner.jpg',
      output: 'og.jpg',
      run: (i) =>
        sharp(i).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, mozjpeg: true }),
    },
  ];
  console.log('Brand assets:');
  let ok = true;
  for (const job of jobs) {
    const input = path.join(PUBLIC_DIR, job.input);
    const output = path.join(PUBLIC_DIR, job.output);
    try {
      if (!existsSync(input)) {
        if (existsSync(output)) {
          console.log(`  · ${job.output} (source ${job.input} removed; keeping existing output)`);
          continue;
        }
        throw new Error(`missing source public/${job.input}`);
      }
      if (!flags.force && isFresh([output], [input, self])) {
        console.log(`  · ${job.output} up to date (${kb((await stat(output)).size)})`);
        continue;
      }
      await mkdir(path.dirname(output), { recursive: true });
      await job.run(input).toFile(output);
      const m = await sharp(output).metadata();
      console.log(`  ✓ ${job.output.padEnd(22)} ${m.width}x${m.height} ${kb((await stat(output)).size)}`);
    } catch (err) {
      ok = false;
      console.error(`  ✗ ${job.output}: ${(err as Error).message}`);
    }
  }
  console.log();
  return ok;
}

// ---------------------------------------------------------------- main

const started = Date.now();
try {
  let ok = true;
  if (flags.brand) ok = await syncBrand();
  else {
    if (!flags.only.length) ok = (await syncBrand()) && ok;
    ok = (await syncWorks()) && ok;
  }
  console.log(`Done in ${secs(Date.now() - started)}`);
  process.exit(ok ? 0 : 1);
} catch (err) {
  console.error(`\nError: ${(err as Error).stack ?? err}`);
  process.exit(1);
}
