/**
 * The map style: a MapLibre style factory over OpenFreeMap's free, keyless OpenMapTiles vector tiles.
 *
 * The palette also tells the page how to dress the map around it (light/dark theme, how the cloud
 * layer blends), so clouds and vignette always match. Chosen by eye from five candidates in a
 * temporary style lab (see git history: map/style-lab).
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

/** Violet Dusk: deep violet night, pink neon streets, peach motorways. */
export const DUSK: MapPalette = {
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
  };


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
