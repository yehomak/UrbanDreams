import { useEffect, useEffectEvent, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Work } from '@/content/works.ts';
import { MAP_CENTER, MAP_ZOOM, WARSAW_BOUNDS } from '@/content/geo.ts';
import { districtName } from '@/content/works.ts';
import { CloudLayer } from './CloudLayer.tsx';
import './WorldMap.css';

interface Props {
  works: readonly Work[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}

/**
 * Base map: Esri "World Light Gray Base" — keyless, label-free, quiet enough to let the art speak.
 * (CARTO's free basemaps started requiring an API key, which silently broke the original map.)
 * Override with VITE_TILE_URL / VITE_TILE_ATTRIBUTION for any XYZ provider.
 */
const TILE_URL =
  import.meta.env.VITE_TILE_URL ??
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const ATTRIBUTION =
  import.meta.env.VITE_TILE_ATTRIBUTION ?? 'Tiles &copy; <a href="https://www.esri.com">Esri</a> — Esri, HERE, Garmin, &copy; OpenStreetMap contributors';

/** Pin size follows zoom through a CSS variable, so icons never need rebuilding. */
function pinSizeFor(zoom: number) {
  return Math.round(Math.min(52, Math.max(22, 6 * zoom - 50)));
}

function pinIcon(work: Work) {
  return L.divIcon({
    className: 'pin',
    html: `<span class="pin__halo"></span><span class="pin__emoji" style="--v:${work.id % 5}">${work.marker}</span>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
}

/**
 * Leaflet is imperative; this component owns it and exposes a tiny declarative surface:
 * which works to show, which one is selected, and a callback.
 */
export function WorldMap({ works, selectedSlug, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const fittedRef = useRef(false);
  // Leaflet listeners are attached once; this always calls the latest onSelect.
  const select = useEffectEvent((slug: string | null) => onSelect(slug));

  // Create the map once
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const b = WARSAW_BOUNDS;
    const map = L.map(host, {
      center: [...MAP_CENTER],
      zoom: MAP_ZOOM.initial,
      minZoom: MAP_ZOOM.min,
      maxZoom: MAP_ZOOM.max,
      maxBounds: [
        [b.south, b.west],
        [b.north, b.east],
      ],
      maxBoundsViscosity: 0.8,
      zoomControl: false,
      attributionControl: false,
      bounceAtZoomLimits: false,
    });
    L.tileLayer(TILE_URL, { maxNativeZoom: 16, keepBuffer: 4 }).addTo(map);
    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution(ATTRIBUTION).addTo(map);

    const syncPinSize = () => host.style.setProperty('--pin', `${pinSizeFor(map.getZoom())}px`);
    syncPinSize();
    map.on('zoomend', syncPinSize);
    map.on('click', () => select(null));

    mapRef.current = map;
    const markers = markersRef.current;
    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
      fittedRef.current = false;
    };
  }, []);

  // Sync markers with works
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    for (const work of works) {
      if (markers.has(work.slug)) continue;
      const marker = L.marker([work.location.lat, work.location.lng], {
        icon: pinIcon(work),
        title: work.title,
        alt: work.title,
        riseOnHover: true,
        keyboard: true,
      })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          select(work.slug);
        })
        .addTo(map);
      const el = marker.getElement();
      if (el) {
        el.dataset.testid = `pin-${work.slug}`;
        // Leaflet gives markers role=button + tabindex but no name and no Enter/Space handling
        el.setAttribute('aria-label', `${work.title} — ${work.style}, ${districtName(work.location.district)}`);
        el.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          select(work.slug);
        });
      }
      markers.set(work.slug, marker);
    }

    // First paint: frame every work, leaving room for the header and the intro card
    if (!fittedRef.current && works.length > 0) {
      fittedRef.current = true;
      const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      map.fitBounds(L.latLngBounds(works.map((w) => [w.location.lat, w.location.lng])), {
        paddingTopLeft: [32, header + (map.getSize().x <= 640 ? 110 : 32)],
        paddingBottomRight: [32, 96],
        maxZoom: 14,
        animate: false,
      });
    }
    for (const [slug, marker] of markers) {
      if (!works.some((w) => w.slug === slug)) {
        marker.remove();
        markers.delete(slug);
      }
    }
  }, [works]);

  // Highlight + frame the selected work, leaving room for the preview panel
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const [slug, marker] of markersRef.current) {
      marker.getElement()?.classList.toggle('is-selected', slug === selectedSlug);
    }
    const marker = selectedSlug ? markersRef.current.get(selectedSlug) : undefined;
    if (!marker) return;

    const size = map.getSize();
    const zoom = Math.max(map.getZoom(), 14);
    const target = map.project(marker.getLatLng(), zoom);
    // Centre the pin in the part of the map the preview doesn't cover (below header, beside/above the panel)
    let top = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
    const left = 0;
    let [right, bottom] = [size.x, size.y];
    const panel = document.querySelector('[data-testid="work-preview"]')?.getBoundingClientRect();
    if (panel) {
      if (panel.width > size.x * 0.6) bottom = Math.min(bottom, panel.top);
      else right = Math.min(right, panel.left);
    }
    if (bottom - top < 80) top = 0; // degenerate (tiny landscape): just centre
    const free = L.point((left + right) / 2, (top + bottom) / 2);
    const offset = L.point(size.x / 2, size.y / 2).subtract(free);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.flyTo(map.unproject(target.add(offset), zoom), zoom, { duration: reduced ? 0 : 1.1, easeLinearity: 0.3 });
  }, [selectedSlug]);

  return (
    <div className="world-map" data-testid="map">
      <div ref={hostRef} className="world-map__host" />
      <CloudLayer />
      <div className="world-map__vignette" aria-hidden="true" />
    </div>
  );
}
