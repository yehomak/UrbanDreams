import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { collection, getWork, works } from '@/content/works.ts';
import { WorldMap } from '@/components/map/WorldMap.tsx';
import { WorkPreview } from '@/components/map/WorkPreview.tsx';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';
import './MapPage.css';

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const selected = getWork(params.get('work') ?? undefined) ?? null;
  useDocumentTitle(selected?.title);

  // The selection lives in the URL (/?work=acid-tree) so every view is shareable.
  const select = useCallback(
    (slug: string | null) => setParams(slug ? { work: slug } : {}, { replace: true, preventScrollReset: true }),
    [setParams],
  );
  const close = useCallback(() => select(null), [select]);

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
      <WorldMap works={works} selectedSlug={selected?.slug ?? null} onSelect={select} />

      <section className="map-intro rise" aria-label="About this map">
        <p className="map-intro__tagline">{collection.tagline}</p>
        <p className="map-intro__stats">
          {works.length} works · {stats.styles} painting styles · {stats.districts} districts
        </p>
        <p className="map-intro__hint">Tap a pin to see what the street dreamed.</p>
        <Link to="/works" className="map-intro__link" viewTransition>
          Browse all works →
        </Link>
      </section>

      {selected && <WorkPreview work={selected} onClose={close} onNavigate={select} />}
    </div>
  );
}
