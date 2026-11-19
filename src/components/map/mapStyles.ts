/**
 * Map styles over OpenFreeMap's free, keyless OpenMapTiles vector tiles.
 *
 * One style factory, several palettes. Each palette also tells the page how to dress the map
 * around it (light/dark theme, how the cloud layer blends), so clouds and vignette always match.
 *
 * TEMPORARY: several palettes ship behind a style switcher on the map (MapStyleLab) so the
 * final look can be chosen by eye. Once chosen, keep that palette and delete the rest.
 */
import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';

export interface MapPalette {
  id: string;
  name: string;
  theme: 'light' | 'dark';
  clouds: { opacity: number; blend: 'normal' | 'screen' };
  land: string;
  residential: string;
  park: string;
  water: string;
  waterLine: string;
  building: string;
  buildingEdge: string;
  minor: string;
  major: string;
  motorway: string;
  /** Optional wide blurred halo under major roads (street-light glow). */
  glow?: string;
  rail: string;
  label: string;
  labelHalo: string;
  waterLabel: string;
  /** Multiplier for all road widths (thin ink lines vs. bold streets). */
  roadScale?: number;
}

export const MAP_PALETTES = [
  {
    // The original Urban Dreams look: a pale, label-light city under white clouds
    id: 'dream',
    name: 'Cloud Dream',
    theme: 'light',
    clouds: { opacity: 0.34, blend: 'normal' },
    land: '#e9ebee',
    residential: '#e4e6ea',
    park: '#dde4de',
    water: '#c6d1dc',
    waterLine: '#b6c3cf',
    building: '#dfe2e6',
    buildingEdge: '#d2d6db',
    minor: '#f8f9fa',
    major: '#ffffff',
    motorway: '#ffffff',
    rail: '#cdd2d8',
    label: 'rgba(58, 68, 82, 0.42)',
    labelHalo: 'rgba(233, 235, 238, 0.9)',
    waterLabel: 'rgba(84, 106, 128, 0.55)',
    roadScale: 1.15,
  },
  {
    id: 'night',
    name: 'Night Warsaw',
    theme: 'dark',
    clouds: { opacity: 0.1, blend: 'screen' },
    land: '#141215',
    residential: '#19171b',
    park: '#171c18',
    water: '#1f2a33',
    waterLine: '#2a3944',
    building: '#1e1c21',
    buildingEdge: '#28252b',
    minor: '#2b2722',
    major: 'rgba(242, 166, 90, 0.42)',
    motorway: 'rgba(242, 166, 90, 0.6)',
    glow: 'rgba(242, 166, 90, 0.12)',
    rail: '#3a342d',
    label: 'rgba(240, 232, 217, 0.34)',
    labelHalo: 'rgba(19, 18, 21, 0.9)',
    waterLabel: 'rgba(169, 191, 204, 0.42)',
  },
  {
    // Peach paper, mint parks, lavender river
    id: 'pastel',
    name: 'Pastel Sleep',
    theme: 'light',
    clouds: { opacity: 0.3, blend: 'normal' },
    land: '#f3e6df',
    residential: '#efded6',
    park: '#d9e8d3',
    water: '#c8cbeb',
    waterLine: '#b5bae2',
    building: '#ead5cd',
    buildingEdge: '#e0c6bc',
    minor: '#fffaf6',
    major: '#f5c2b0',
    motorway: '#ef9f94',
    rail: '#d8c4d6',
    label: 'rgba(118, 78, 98, 0.5)',
    labelHalo: 'rgba(243, 230, 223, 0.9)',
    waterLabel: 'rgba(96, 98, 160, 0.6)',
    roadScale: 1.1,
  },
  {
    // Ink on cream paper, like a map drawn by hand in a sketchbook
    id: 'ink',
    name: 'Ink Sketch',
    theme: 'light',
    clouds: { opacity: 0.26, blend: 'normal' },
    land: '#f2ead9',
    residential: '#efe6d3',
    park: '#e6dfc7',
    water: '#d3dad8',
    waterLine: '#4e4537',
    building: '#ebe1cc',
    buildingEdge: '#9b8d74',
    minor: 'rgba(62, 52, 38, 0.55)',
    major: '#3a3125',
    motorway: '#2a2219',
    rail: '#6b5e4b',
    label: 'rgba(48, 40, 30, 0.62)',
    labelHalo: 'rgba(242, 234, 217, 0.9)',
    waterLabel: 'rgba(48, 40, 30, 0.55)',
    roadScale: 0.55,
  },
  {
    // Deep violet dusk with pink neon streets
    id: 'dusk',
    name: 'Violet Dusk',
    theme: 'dark',
    clouds: { opacity: 0.14, blend: 'screen' },
    land: '#251d3a',
    residential: '#2a2142',
    park: '#252b40',
    water: '#17162e',
    waterLine: '#352f5c',
    building: '#30264a',
    buildingEdge: '#3c3159',
    minor: '#40355f',
    major: 'rgba(255, 158, 186, 0.55)',
    motorway: 'rgba(255, 206, 160, 0.75)',
    glow: 'rgba(255, 140, 175, 0.16)',
    rail: '#4a3e6e',
    label: 'rgba(236, 222, 255, 0.42)',
    labelHalo: 'rgba(37, 29, 58, 0.9)',
    waterLabel: 'rgba(196, 186, 255, 0.5)',
  },
] as const satisfies readonly MapPalette[];

export type MapStyleId = (typeof MAP_PALETTES)[number]['id'];
export const DEFAULT_MAP_STYLE: MapStyleId = 'dream';

export function getPalette(id: string | null | undefined): MapPalette {
  return MAP_PALETTES.find((p) => p.id === id) ?? MAP_PALETTES.find((p) => p.id === DEFAULT_MAP_STYLE)!;
}

export const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> · ' +
  '<a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a> · ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>';

const MAJOR: ExpressionSpecification = ['match', ['get', 'class'], ['primary', 'secondary', 'trunk'], true, false];
const MINOR: ExpressionSpecification = ['match', ['get', 'class'], ['tertiary', 'minor', 'service', 'street'], true, false];

export function createMapStyle(p: MapPalette): StyleSpecification {
  const k = p.roadScale ?? 1;
  /** Line width that grows with zoom: [zoom, width] pairs, scaled per palette. */
  const grow = (...stops: Array<[number, number]>): ExpressionSpecification =>
    ['interpolate', ['exponential', 1.5], ['zoom'], ...stops.flatMap(([z, w]) => [z, w * k])] as ExpressionSpecification;
  const round = { 'line-cap': 'round', 'line-join': 'round' } as const;

  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: OPENFREEMAP_ATTRIBUTION },
    },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': p.land } },
      {
        id: 'residential',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood']]],
        paint: { 'fill-color': p.residential },
      },
      {
        id: 'parks',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'park']]],
        paint: { 'fill-color': p.park },
      },
      { id: 'parks-landuse', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': p.park } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': p.water } },
      {
        id: 'water-edge',
        type: 'line',
        source: 'omt',
        'source-layer': 'water',
        paint: { 'line-color': p.waterLine, 'line-width': grow([11, 0.4], [16, 1.2]) },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'omt',
        'source-layer': 'waterway',
        paint: { 'line-color': p.water, 'line-width': grow([11, 0.6], [16, 3]) },
      },
      {
        id: 'buildings',
        type: 'fill',
        source: 'omt',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-color': p.building,
          'fill-outline-color': p.buildingEdge,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1],
        },
      },
      {
        id: 'rail',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['rail', 'transit']]],
        paint: { 'line-color': p.rail, 'line-width': grow([12, 0.5], [17, 1.5]), 'line-dasharray': [2, 2] },
      },
      {
        id: 'roads-minor',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: MINOR,
        layout: round,
        paint: { 'line-color': p.minor, 'line-width': grow([12, 0.3], [14, 1], [17, 5]) },
      },
      ...(p.glow
        ? [
            {
              id: 'roads-major-glow',
              type: 'line' as const,
              source: 'omt',
              'source-layer': 'transportation',
              filter: ['any', MAJOR, ['==', ['get', 'class'], 'motorway']] as ExpressionSpecification,
              layout: round,
              paint: {
                'line-color': p.glow,
                'line-width': grow([11, 3], [14, 8], [17, 22]),
                'line-blur': grow([11, 3], [17, 14]),
              },
            },
          ]
        : []),
      {
        id: 'roads-major',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: MAJOR,
        layout: round,
        paint: { 'line-color': p.major, 'line-width': grow([11, 0.5], [14, 1.4], [17, 6]) },
      },
      {
        id: 'roads-motorway',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'motorway'],
        layout: round,
        paint: { 'line-color': p.motorway, 'line-width': grow([11, 0.8], [14, 2], [17, 8]) },
      },
      {
        id: 'water-name',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'water_name',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-letter-spacing': 0.4,
          'text-transform': 'uppercase',
          'symbol-placement': 'line',
        },
        paint: { 'text-color': p.waterLabel, 'text-halo-color': p.labelHalo, 'text-halo-width': 1 },
      },
      {
        id: 'districts',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        filter: ['in', ['get', 'class'], ['literal', ['suburb', 'quarter', 'neighbourhood']]],
        minzoom: 11,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 9, 15, 12],
          'text-letter-spacing': 0.32,
          'text-transform': 'uppercase',
          'text-max-width': 8,
        },
        paint: { 'text-color': p.label, 'text-halo-color': p.labelHalo, 'text-halo-width': 1.2 },
      },
    ],
  };
}
