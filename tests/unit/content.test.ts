import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadContent } from '../../scripts/catalog-plugin.ts';
import { isInWarsaw } from '../../src/content/geo.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const { collection, works, media } = loadContent();

describe('content contract', () => {
  it('has a collection and works', () => {
    expect(collection.name).toBe('Urban Dreams');
    expect(works.length).toBeGreaterThan(0);
  });

  it('numbers works sequentially and gives each a unique slug', () => {
    expect(works.map((w) => w.id)).toEqual(works.map((_, i) => i));
    expect(new Set(works.map((w) => w.slug)).size).toBe(works.length);
  });

  it('names each file after its id and slug', () => {
    for (const w of works) {
      const file = join(ROOT, 'content/works', `${String(w.id).padStart(2, '0')}-${w.slug}.json`);
      expect(existsSync(file), file).toBe(true);
    }
  });

  it('places every work inside Warsaw', () => {
    for (const w of works) expect(isInWarsaw(w.location.lat, w.location.lng), w.slug).toBe(true);
  });

  it('ships optimised media for every work', () => {
    for (const w of works) {
      expect(media[w.slug], `content/media.json is missing ${w.slug}`).toBeDefined();
      for (const variant of ['webp', 'poster.webp', 'thumb.webp']) {
        const file = join(ROOT, 'public/media/works', `${w.slug}.${variant}`);
        expect(existsSync(file), file).toBe(true);
      }
    }
  });

  it('keeps media within the performance budget', () => {
    for (const w of works) {
      const full = statSync(join(ROOT, 'public/media/works', `${w.slug}.webp`)).size;
      const poster = statSync(join(ROOT, 'public/media/works', `${w.slug}.poster.webp`)).size;
      expect(full, `${w.slug}.webp`).toBeLessThan(3.5 * 1024 * 1024);
      expect(poster, `${w.slug}.poster.webp`).toBeLessThan(150 * 1024);
    }
  });

  it('has no media for works that do not exist', () => {
    const slugs = new Set(works.map((w) => w.slug));
    expect(Object.keys(media).filter((s) => !slugs.has(s))).toEqual([]);
  });
});
