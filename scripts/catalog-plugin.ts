/**
 * Vite plugin: validates `content/` and publishes it in machine-readable form.
 *
 *   /catalog.json  every work with absolute media URLs (for agents, scrapers, other apps)
 *   /llms.txt      plain-text summary of the project for LLM crawlers
 *
 * Invalid content fails `vite build` (and shows an error in `vite dev`).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { CollectionSchema, MediaManifestSchema, WorkSchema } from '../src/content/schema.ts';

const ROOT = join(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'content');
const SITE_URL = (process.env.SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? '').replace(/\/$/, '');

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function loadContent() {
  const collection = CollectionSchema.parse(readJson(join(CONTENT, 'collection.json')));
  const files = readdirSync(join(CONTENT, 'works')).filter((f) => f.endsWith('.json')).sort();
  const works = files.map((file) => {
    const result = WorkSchema.safeParse(readJson(join(CONTENT, 'works', file)));
    if (!result.success) throw new Error(`content/works/${file}: ${result.error.message}`);
    return result.data;
  });

  const seen = new Set<string>();
  works.forEach((w, i) => {
    if (w.id !== i) throw new Error(`Work ids must be sequential from 0: expected ${i}, got ${w.id} (${w.slug})`);
    if (seen.has(w.slug)) throw new Error(`Duplicate slug: ${w.slug}`);
    seen.add(w.slug);
  });

  const mediaPath = join(CONTENT, 'media.json');
  const media = existsSync(mediaPath) ? MediaManifestSchema.parse(readJson(mediaPath)) : {};
  return { collection, works, media };
}

function absolute(path: string) {
  return SITE_URL ? `${SITE_URL.startsWith('http') ? SITE_URL : `https://${SITE_URL}`}${path}` : path;
}

function buildCatalog() {
  const { collection, works, media } = loadContent();
  return {
    ...collection,
    generatedAt: new Date().toISOString().slice(0, 10),
    works: works.map((w) => ({
      ...w,
      url: absolute(`/works/${w.slug}`),
      image: absolute(`/media/works/${w.slug}.webp`),
      poster: absolute(`/media/works/${w.slug}.poster.webp`),
      dimensions: media[w.slug] ? { width: media[w.slug]!.width, height: media[w.slug]!.height } : null,
    })),
  };
}

function buildLlmsTxt() {
  const { collection, works } = loadContent();
  const lines = [
    `# ${collection.name}`,
    '',
    `> ${collection.tagline} ${collection.description}`,
    '',
    'Each work is a street photograph of Warsaw re-rendered by a neural style-transfer model in the manner of a painting tradition, then pinned to the coordinates where it was taken.',
    `Full structured data: ${absolute('/catalog.json')}`,
    '',
    '## Works',
    '',
    ...works.map(
      (w) =>
        `- [${w.title}](${absolute(`/works/${w.slug}`)}): ${w.style}, ${w.location.district} (${w.location.lat}, ${w.location.lng}). ${w.mood.time}, ${w.mood.weather.toLowerCase()}, ${w.mood.atmosphere.toLowerCase()}.`,
    ),
    '',
    '## Pages',
    '',
    `- [Map](${absolute('/')}): every work on a map of Warsaw`,
    `- [Works](${absolute('/works')}): the full collection`,
    `- [About](${absolute('/about')}): the idea and how the images are made`,
    '',
  ];
  return lines.join('\n');
}

export function catalogPlugin(): Plugin {
  return {
    name: 'urban-dreams-catalog',
    buildStart() {
      loadContent(); // fail fast on invalid content
      this.addWatchFile(CONTENT);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          if (req.url === '/catalog.json') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.end(JSON.stringify(buildCatalog(), null, 2));
          }
          if (req.url === '/llms.txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(buildLlmsTxt());
          }
        } catch (error) {
          return next(error);
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'catalog.json', source: JSON.stringify(buildCatalog(), null, 2) });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt() });
    },
  };
}
