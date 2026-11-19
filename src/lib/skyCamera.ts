import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Lets the sky follow the map: while bound, `skyCamera` describes how the map has moved since the
 * moment of binding (pan and zoom around a fixed point on the ground). Sky reads it every frame.
 * Unbound (loading, other pages) it is the identity, so clouds stay in screen space.
 */
export const skyCamera = {
  /** The anchor's screen position when bound, and now. */
  px: 0,
  py: 0,
  qx: 0,
  qy: 0,
  /** Map scale relative to when bound (2^Δzoom). */
  k: 1,
};

export function bindSkyToMap(map: MapLibreMap): () => void {
  const anchor = map.getCenter();
  const start = map.project(anchor);
  const zoom0 = map.getZoom();
  const update = () => {
    const now = map.project(anchor);
    skyCamera.qx = now.x;
    skyCamera.qy = now.y;
    skyCamera.k = 2 ** (map.getZoom() - zoom0);
  };
  skyCamera.px = start.x;
  skyCamera.py = start.y;
  update();
  map.on('move', update);
  return () => {
    map.off('move', update);
    Object.assign(skyCamera, { px: 0, py: 0, qx: 0, qy: 0, k: 1 });
  };
}
