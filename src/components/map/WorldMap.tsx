import { useEffect, useEffectEvent, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre derives its worker URL from its own module URL, which bundling breaks: point it explicitly.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { districtName, type Work } from '@/content/works.ts';
import { MAP_CENTER, MAP_ZOOM, WARSAW_BOUNDS } from '@/content/geo.ts';
import { createMapStyle, type MapPalette } from './mapStyles.ts';
import { bindSkyToMap } from '@/lib/skyCamera.ts';
import { pinAnchor } from '@/lib/pinAnchor.ts';
import { cubicBezier, previewLayout } from './previewLayout.ts';
import './WorldMap.css';

interface Props {
  works: readonly Work[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  palette: MapPalette;
  /** Called once the map has drawn (or definitively failed): lifts the loading curtain. */
  onReady?: () => void;
}

const READY_TIMEOUT_MS = 6000;
/** Camera glide: a quick start, a long soft landing. */
const cameraEase = cubicBezier(0.3, 0, 0.15, 1);

/** Attribution stays (OSM/OpenMapTiles licences require it) but folds into a small ⓘ. */
function collapseAttribution(host: HTMLElement) {
  host.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
}

maplibregl.setWorkerUrl(workerUrl);

/** Candidate idle animations for pins (see WorldMap.css). TEMPORARY: keep one once chosen. */
const PIN_ANIMS = ['float', 'sway', 'glow', 'twinkle'] as const;

/**
 * Pin size follows zoom through a CSS variable, so markers never need rebuilding.
 * Exponential like the map itself: ×1.41 per zoom level, small over the whole city, big up close.
 */
function pinSizeFor(zoom: number) {
  return Math.round(Math.min(60, Math.max(16, 24 * 2 ** ((zoom - 12) / 2))));
}

function pinElement(work: Work, onActivate: () => void): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'pin';
  el.dataset.testid = `pin-${work.slug}`;
  el.setAttribute('aria-label', `${work.title} — ${work.style}, ${districtName(work.location.district)}`);
  // TEMPORARY animation lab: every pin gets one of five idle animations so they can be compared side by side
  el.dataset.anim = PIN_ANIMS[(work.id * 7 + 3) % PIN_ANIMS.length];
  el.innerHTML = `<span class="pin__halo"></span><span class="pin__emoji" style="--v:${work.id % 5}">${work.marker}</span>`;
  // Warm the artwork up before the click
  el.addEventListener('pointerenter', () => (new Image().src = work.media.full), { once: true });
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onActivate();
  });
  return el;
}

function hasWebGL(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}


/**
 * MapLibre is imperative; this component owns it and exposes a tiny declarative surface:
 * which works to show, which one is selected, and a callback.
 */
export function WorldMap({ works, selectedSlug, onSelect, palette, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, maplibregl.Marker>());
  const [failed] = useState(() => !hasWebGL());
  const select = useEffectEvent((slug: string | null) => onSelect(slug));
  const ready = useEffectEvent(() => onReady?.());

  // Create the map once
  useEffect(() => {
    const host = hostRef.current;
    if (!host || failed) {
      ready();
      return;
    }
    const b = WARSAW_BOUNDS;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: host,
        style: createMapStyle(palette),
        center: [MAP_CENTER[1], MAP_CENTER[0]],
        zoom: MAP_ZOOM.initial,
        minZoom: MAP_ZOOM.min,
        maxZoom: MAP_ZOOM.max,
        maxBounds: [
          [b.west, b.south],
          [b.east, b.north],
        ],
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        fadeDuration: reduced ? 0 : 300,
      });
    } catch (error) {
      console.warn('Map failed to start', error); // the rest of the site still works
      ready();
      return;
    }
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();

    const syncPinSize = () => host.style.setProperty('--pin', `${pinSizeFor(map.getZoom())}px`);
    map.on('zoom', syncPinSize);
    map.on('click', () => select(null));
    // Never leave the curtain closed: lift it when drawn, on a fatal style error, or after a timeout
    const readyTimer = window.setTimeout(ready, READY_TIMEOUT_MS);
    let unbindSky = () => {};
    map.once('load', () => {
      window.clearTimeout(readyTimer);
      collapseAttribution(host);
      // From here on the clouds belong to the map: they pan and zoom with the city
      unbindSky = bindSkyToMap(map);
      ready();
    });
    map.once('error', () => ready());

    // Frame every work on first paint
    if (works.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      for (const w of works) bounds.extend([w.location.lng, w.location.lat]);
      const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      map.fitBounds(bounds, {
        padding: { top: header + 40, left: 40, right: 40, bottom: 40 },
        maxZoom: MAP_ZOOM.focus - 0.5,
        animate: false,
      });
    }
    syncPinSize();

    const markers = markersRef.current;
    for (const work of works) {
      const marker = new maplibregl.Marker({ element: pinElement(work, () => select(work.slug)), anchor: 'center' })
        .setLngLat([work.location.lng, work.location.lat])
        .addTo(map);
      markers.set(work.slug, marker);
    }

    mapRef.current = map;
    return () => {
      window.clearTimeout(readyTimer);
      unbindSky();
      for (const m of markers.values()) m.remove();
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // `works` and `palette` are static: the map is built once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bring the selected pin to the anchor point, then let its card unfold above it.
  useEffect(() => {
    const map = mapRef.current;
    const host = hostRef.current;
    if (!map || !host) return;
    for (const [slug, marker] of markersRef.current) {
      marker.getElement().classList.toggle('is-selected', slug === selectedSlug);
    }
    host.dataset.selection = selectedSlug ? 'true' : 'false';
    const marker = selectedSlug ? markersRef.current.get(selectedSlug) : undefined;
    if (!marker) {
      pinAnchor.set({ slug: null });
      return;
    }
    const lngLat = marker.getLngLat();
    const publish = () => {
      const p = map.project(lngLat);
      pinAnchor.set({ x: p.x, y: p.y });
    };

    // Duration follows distance: a nearby pin moves quickly, a far one glides (350–900ms)
    const { anchorY, H, anchorX } = previewLayout();
    const zoom = Math.max(map.getZoom(), MAP_ZOOM.focus);
    const from = map.project(lngLat);
    const px = Math.hypot(from.x - anchorX, from.y - anchorY);
    const dz = zoom - map.getZoom();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const still = px < 24 && dz < 0.01;
    const duration = reduced || still ? 0 : Math.min(900, Math.max(350, 300 + 0.45 * px + 180 * dz));

    // The card unfolds when the pin is all but settled (80% of the glide), never on a stale selection
    pinAnchor.set({ slug: selectedSlug, unfoldAt: performance.now() + duration * 0.8 });
    publish();
    if (!still) {
      map.easeTo({
        center: lngLat,
        zoom,
        offset: [0, anchorY - H / 2],
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration,
        easing: cameraEase,
      });
    }

    // Keep the card attached while the camera (or the visitor) moves the map
    let raf = 0;
    const onMove = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          publish();
        });
    };
    map.on('move', onMove);
    return () => {
      map.off('move', onMove);
      cancelAnimationFrame(raf);
    };
  }, [selectedSlug]);

  return (
    <div className="world-map" data-testid="map" data-theme={palette.theme} style={{ background: palette.land }}>
      <div ref={hostRef} className="world-map__host" />
      {failed && (
        <p className="world-map__fallback">
          The map needs WebGL, which this browser has turned off. All the works are in the gallery.
        </p>
      )}
      <div className="world-map__vignette" aria-hidden="true" />
    </div>
  );
}
