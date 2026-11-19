/**
 * Content contract for `content/`.
 *
 * Validation runs in tests and at build time (scripts/catalog-plugin.ts).
 * Runtime code imports only the inferred *types* from here, so zod never ships to the browser.
 */
import { z } from 'zod';
import { isInWarsaw } from './geo.ts';

const label = z.string().trim().min(1);

export const WorkSchema = z
  .object({
    /** Stable, sequential. Defines order on the map and in the gallery. */
    id: z.number().int().nonnegative(),
    /** URL segment and media file stem: /works/<slug>, /media/works/<slug>.webp */
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: label,
    /** Curatorial text. May be empty: the work then speaks for itself. */
    description: z.string(),
    /** Single emoji used as the map pin. */
    marker: label.max(16),
    /** The painting tradition the photo was transferred into. */
    style: label,
    location: z
      .object({
        district: label,
        lat: z.number(),
        lng: z.number(),
      })
      .strict()
      .refine((l) => isInWarsaw(l.lat, l.lng), { message: 'Coordinates must be inside Warsaw' }),
    mood: z
      .object({
        time: label,
        weather: label,
        atmosphere: label,
      })
      .strict(),
    /** Who made / contributed the work. Defaults to the project when absent. */
    credit: label.optional(),
  })
  .strict();

export const MediaEntrySchema = z
  .object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    frames: z.number().int().positive(),
    bytes: z.object({ full: z.number(), poster: z.number(), thumb: z.number() }).strict(),
  })
  .strict();

export const MediaManifestSchema = z.record(z.string(), MediaEntrySchema);

export const CollectionSchema = z
  .object({
    name: label,
    tagline: label,
    description: label,
    city: label,
    links: z.array(z.object({ label, href: z.url() }).strict()),
  })
  .strict();

export type WorkRecord = z.infer<typeof WorkSchema>;
export type MediaEntry = z.infer<typeof MediaEntrySchema>;
export type Collection = z.infer<typeof CollectionSchema>;
