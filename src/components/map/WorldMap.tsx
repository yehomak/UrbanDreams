import { useEffect, useEffectEvent, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre derives its worker URL from its own module URL, which bundling breaks: point it explicitly.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { districtName, type Work } from '@/content/works.ts';
import { MAP_CENTER, MAP_ZOOM, WARSAW_BOUNDS } from '@/content/geo.ts';
import { createMapStyle, type MapPalette } from './mapStyles.ts';
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

/** Attribution stays (OSM/OpenMapTiles licences require it) but folds into a small ⓘ. */
function collapseAttribution(host: HTMLElement) {
  host.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
}

maplibregl.setWorkerUrl(workerUrl);

/** Pin size follows zoom through a CSS variable, so markers never need rebuilding. */
function pinSizeFor(zoom: number) {
  return Math.round(Math.min(52, Math.max(22, 6 * zoom - 44)));
}

function pinElement(work: Work, onActivate: () => void): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'pin';
  el.dataset.testid = `pin-${work.slug}`;
  el.setAttribute('aria-label', `${work.title} — ${work.style}, ${districtName(work.location.district)}`);
  el.innerHTML = `<span class="pin__halo"></span><span class="pin__emoji" style="--v:${work.id % 5}">${work.marker}</span>`;
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

/** The part of the map the preview panel doesn't cover, as camera padding. */
function freeAreaPadding(container: HTMLElement): maplibregl.PaddingOptions {
  const box = container.getBoundingClientRect();
  const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  const pad = { top: header + 24, left: 24, right: 24, bottom: 24 };
  const panel = document.querySelector('[data-testid="work-preview"]')?.getBoundingClientRect();
  if (panel) {
    if (panel.width > box.width * 0.6) pad.bottom = box.height - panel.top + 24;
    else pad.right = box.width - panel.left + 24;
  }
  if (box.height - pad.top - pad.bottom < 80) Object.assign(pad, { top: 0, bottom: 0 });
  return pad;
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
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

    const syncPinSize = () => host.style.setProperty('--pin', `${pinSizeFor(map.getZoom())}px`);
    map.on('zoom', syncPinSize);
    map.on('click', () => select(null));
    // Never leave the curtain closed: lift it when drawn, on a fatal style error, or after a timeout
    const readyTimer = window.setTimeout(ready, READY_TIMEOUT_MS);
    map.once('load', () => {
      window.clearTimeout(readyTimer);
      collapseAttribution(host);
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
      for (const m of markers.values()) m.remove();
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // `works` and `palette` are static: the map is built once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight + frame the selected work in the area the preview doesn't cover
  useEffect(() => {
    const map = mapRef.current;
    const host = hostRef.current;
    if (!map || !host) return;
    for (const [slug, marker] of markersRef.current) {
      marker.getElement().classList.toggle('is-selected', slug === selectedSlug);
    }
    const marker = selectedSlug ? markersRef.current.get(selectedSlug) : undefined;
    if (!marker) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.flyTo({
      center: marker.getLngLat(),
      zoom: Math.max(map.getZoom(), MAP_ZOOM.focus),
      padding: freeAreaPadding(host),
      duration: reduced ? 0 : 1100,
    });
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
