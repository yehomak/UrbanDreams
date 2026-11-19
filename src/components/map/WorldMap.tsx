import { useEffect, useEffectEvent, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Work } from '@/content/works.ts';
import { MAP_CENTER, MAP_ZOOM, WARSAW_BOUNDS } from '@/content/geo.ts';
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
      marker.getElement()?.setAttribute('data-testid', `pin-${work.slug}`);
      markers.set(work.slug, marker);
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
    const mobile = size.x <= 640;
    const zoom = Math.max(map.getZoom(), 14);
    const target = map.project(marker.getLatLng(), zoom);
    // Phone: pin sits in the upper third above the sheet. Desktop: pin sits left of the side panel.
    const offset = mobile ? L.point(0, size.y * 0.22) : L.point(Math.min(220, size.x * 0.18), 0);
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
