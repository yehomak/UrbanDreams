/** Geographic frame of the project. Shared by the map and by content validation. */

export type LatLng = readonly [lat: number, lng: number];

/** South-west and north-east corners of Warsaw. Every work must sit inside. */
export const WARSAW_BOUNDS = {
  south: 52.0969,
  west: 20.851,
  north: 52.358,
  east: 21.271,
} as const;

export const MAP_CENTER: LatLng = [52.2305, 20.99];
/** MapLibre zoom levels (512px tiles: one level lower than classic 256px raster maps). */
export const MAP_ZOOM = { initial: 12, min: 10.5, max: 16.5, focus: 13.5 } as const;

export function isInWarsaw(lat: number, lng: number): boolean {
  const b = WARSAW_BOUNDS;
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

/** Deep links into the visitor's maps app. No API keys, no SDKs. */
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export function appleMapsUrl(lat: number, lng: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`;
}
