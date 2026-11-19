import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { collection, getWork, works } from '@/content/works.ts';
import { WorldMap } from '@/components/map/WorldMap.tsx';
import { WorkPreview } from '@/components/map/WorkPreview.tsx';
import { MapStyleLab, readStoredStyle, storeStyle } from '@/components/map/MapStyleLab.tsx';
import { getPalette, type MapStyleId } from '@/components/map/mapStyles.ts';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';
import './MapPage.css';

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const [palette, setPalette] = useState(() => getPalette(readStoredStyle()));
  const chooseStyle = useCallback((id: MapStyleId) => {
    storeStyle(id);
    setPalette(getPalette(id));
  }, []);
  const selected = getWork(params.get('work') ?? undefined) ?? null;
  useDocumentTitle(selected?.title);

  // The selection lives in the URL (/?work=acid-tree) so every view is shareable.
  const select = useCallback(
    (slug: string | null) => setParams(slug ? { work: slug } : {}, { replace: true, preventScrollReset: true }),
    [setParams],
  );
  const selectedSlug = selected?.slug;
  const close = useCallback(() => {
    select(null);
    // Hand focus back to the pin the visitor came from
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-testid="pin-${selectedSlug}"]`)?.focus({ preventScroll: true }),
    );
  }, [select, selectedSlug]);

  // /?work=<unknown> → quietly clean the URL
  const rawWork = params.get('work');
  useEffect(() => {
    if (rawWork && !getWork(rawWork)) select(null);
  }, [rawWork, select]);

  const stats = useMemo(
    () => ({
      styles: new Set(works.map((w) => w.style)).size,
      districts: new Set(works.map((w) => w.location.district)).size,
    }),
    [],
  );

  return (
    <div className="map-page" data-has-selection={selected !== null}>
      <h1 className="visually-hidden">{collection.name} — map of Warsaw</h1>
      <WorldMap works={works} selectedSlug={selected?.slug ?? null} onSelect={select} palette={palette} />

      <section className="map-intro surface surface--raised rise" aria-label="About this map">
        <p className="map-intro__tagline display display--s">{collection.tagline}</p>
        <p className="meta map-intro__stats">
          <span>
            <b>{works.length}</b> works
          </span>
          <span>
            <b>{stats.styles}</b> styles
          </span>
          <span>
            <b>{stats.districts}</b> districts
          </span>
        </p>
        <p className="map-intro__hint">Tap a pin to see what the street dreamed.</p>
        <Link to="/works" className="link map-intro__link" viewTransition>
          Browse all works →
        </Link>
      </section>

      <MapStyleLab value={palette.id} onChange={chooseStyle} />

      {selected && <WorkPreview work={selected} onClose={close} onNavigate={select} />}
    </div>
  );
}
