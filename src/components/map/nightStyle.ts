/**
 * "Night Warsaw": a custom MapLibre style over OpenFreeMap's free, keyless OpenMapTiles vector tiles.
 *
 * The city is drawn like it looks from a plane at night: warm ink land, the Vistula as a dark
 * cool ribbon, and the streets glowing faintly in sodium orange, brighter the bigger the road.
 * Colours mirror src/styles/tokens.css. Keep them in sync when the palette changes.
 */
import type { StyleSpecification, ExpressionSpecification } from 'maplibre-gl';

const C = {
  land: '#141215',
  residential: '#19171b',
  park: '#171c18',
  water: '#1f2a33',
  waterLine: '#2a3944',
  building: '#1e1c21',
  buildingEdge: '#28252b',
  minor: '#2b2722',
  rail: '#3a342d',
  lamp: '242, 166, 90', // --accent as RGB
  label: 'rgba(240, 232, 217, 0.34)',
  labelHalo: 'rgba(19, 18, 21, 0.9)',
  waterLabel: 'rgba(169, 191, 204, 0.42)',
} as const;

const lamp = (alpha: number) => `rgba(${C.lamp}, ${alpha})`;

/** Line width that grows with zoom: [zoom, width] pairs. */
const grow = (...stops: Array<[number, number]>): ExpressionSpecification =>
  ['interpolate', ['exponential', 1.5], ['zoom'], ...stops.flat()] as ExpressionSpecification;

const MAJOR: ExpressionSpecification = ['match', ['get', 'class'], ['primary', 'secondary', 'trunk'], true, false];
const MINOR: ExpressionSpecification = ['match', ['get', 'class'], ['tertiary', 'minor', 'service', 'street'], true, false];

export const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> · ' +
  '<a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a> · ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>';

export const nightStyle: StyleSpecification = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: OPENFREEMAP_ATTRIBUTION },
  },
  layers: [
    { id: 'land', type: 'background', paint: { 'background-color': C.land } },
    {
      id: 'residential',
      type: 'fill',
      source: 'omt',
      'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood']]],
      paint: { 'fill-color': C.residential },
    },
    {
      id: 'parks',
      type: 'fill',
      source: 'omt',
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'park']]],
      paint: { 'fill-color': C.park },
    },
    {
      id: 'parks-landuse',
      type: 'fill',
      source: 'omt',
      'source-layer': 'park',
      paint: { 'fill-color': C.park },
    },
    { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.water } },
    {
      id: 'water-edge',
      type: 'line',
      source: 'omt',
      'source-layer': 'water',
      paint: { 'line-color': C.waterLine, 'line-width': grow([11, 0.4], [16, 1.2]) },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'omt',
      'source-layer': 'waterway',
      paint: { 'line-color': C.water, 'line-width': grow([11, 0.6], [16, 3]) },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'omt',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-color': C.building,
        'fill-outline-color': C.buildingEdge,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1],
      },
    },
    {
      id: 'rail',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['rail', 'transit']]],
      paint: { 'line-color': C.rail, 'line-width': grow([12, 0.5], [17, 1.5]), 'line-dasharray': [2, 2] },
    },
    {
      id: 'roads-minor',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: MINOR,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.minor, 'line-width': grow([12, 0.3], [14, 1], [17, 5]) },
    },
    // Sodium glow: a soft wide halo under the major streets…
    {
      id: 'roads-major-glow',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: ['any', MAJOR, ['==', ['get', 'class'], 'motorway']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': lamp(0.12), 'line-width': grow([11, 3], [14, 8], [17, 22]), 'line-blur': grow([11, 3], [17, 14]) },
    },
    // …and the lamp-lit carriageway on top.
    {
      id: 'roads-major',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: MAJOR,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': lamp(0.42), 'line-width': grow([11, 0.5], [14, 1.4], [17, 6]) },
    },
    {
      id: 'roads-motorway',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'motorway'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': lamp(0.6), 'line-width': grow([11, 0.8], [14, 2], [17, 8]) },
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
      paint: { 'text-color': C.waterLabel, 'text-halo-color': C.labelHalo, 'text-halo-width': 1 },
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
      paint: { 'text-color': C.label, 'text-halo-color': C.labelHalo, 'text-halo-width': 1.2 },
    },
  ],
};
