import { useCallback, useEffect, useState } from 'react';
import { useCurtainHold } from '@/components/curtain/curtain.ts';
import { useSearchParams } from 'react-router';
import { collection, getWork, works } from '@/content/works.ts';
import { WorldMap } from '@/components/map/WorldMap.tsx';
import { WorkPreview } from '@/components/map/WorkPreview.tsx';
import { DUSK } from '@/components/map/mapStyles.ts';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';

export function MapPage() {
  const [params, setParams] = useSearchParams();
  // "Loading another map": clouds stay closed until the map has drawn
  const [mapReady, setMapReady] = useState(false);
  useCurtainHold('map', !mapReady);
  const handleReady = useCallback(() => setMapReady(true), []);
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


  return (
    <div className="map-page" data-has-selection={selected !== null}>
      <h1 className="visually-hidden">{collection.name} — map of Warsaw</h1>
      <WorldMap works={works} selectedSlug={selected?.slug ?? null} onSelect={select} palette={DUSK} onReady={handleReady} />

      {selected && <WorkPreview work={selected} onClose={close} onNavigate={select} />}
    </div>
  );
}
