import { useEffect, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { districtName, getWork, neighbours, workNumber } from '@/content/works.ts';
import { directionsUrl, placeUrl } from '@/content/geo.ts';
import { WorkImage } from '@/components/WorkImage.tsx';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';
import { isPlainKey } from '@/lib/keys.ts';
import { artworkTransitionName } from '@/lib/viewTransition.ts';
import { NotFoundPage } from './NotFoundPage.tsx';
import './WorkPage.css';

export function WorkPage() {
  const { slug } = useParams();
  const work = getWork(slug);
  const navigate = useNavigate();
  useDocumentTitle(work?.title ?? 'Not found');

  useEffect(() => {
    if (!work) return;
    const { prev, next } = neighbours(work);
    const onKey = (e: KeyboardEvent) => {
      if (!isPlainKey(e)) return;
      if (e.key === 'ArrowRight') navigate(`/works/${next.slug}`, { viewTransition: true });
      if (e.key === 'ArrowLeft') navigate(`/works/${prev.slug}`, { viewTransition: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [work, navigate]);

  if (!work) return <NotFoundPage />;

  const { prev, next } = neighbours(work);
  const { lat, lng } = work.location;
  const facts: ReadonlyArray<readonly [string, string, boolean?]> = [
    ['Style', work.style],
    ['District', districtName(work.location.district)],
    ['Time', work.mood.time],
    ['Weather', work.mood.weather],
    ['Atmosphere', work.mood.atmosphere],
    ['Coordinates', `${lat.toFixed(5)}, ${lng.toFixed(5)}`, true],
  ];

  return (
    <article className="page work-page" data-testid="work-page">
      <div className="work-page__media rise">
        <div
          className="work-page__matte"
          style={{ viewTransitionName: artworkTransitionName(work.slug), '--aspect': work.media.aspect } as CSSProperties}
        >
          <WorkImage key={work.slug} work={work} variant="full" priority posterUnderlay />
        </div>
      </div>

      <div className="work-page__info">
        <h1 className="display display--l work-page__title rise" style={{ ['--d' as string]: 1 }}>
          <span className="work-page__number">{workNumber(work)}</span> {work.title}
        </h1>

        {work.description ? (
          <p className="work-page__desc rise" style={{ ['--d' as string]: 3 }}>
            {work.description}
          </p>
        ) : (
          <p className="work-page__desc work-page__desc--quiet rise" style={{ ['--d' as string]: 3 }}>
            No words for this one. Go and stand where it was taken.
          </p>
        )}

        <section className="label surface rise" style={{ ['--d' as string]: 4 }} aria-label="About this work">
          <dl className="facts">
            {facts.map(([k, v, mono]) => (
              <div key={k} className="facts__row">
                <dt className="meta">{k}</dt>
                <dd className={mono ? 'facts__mono' : undefined}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="label__actions">
            <a className="button button--primary" href={directionsUrl(lat, lng)} target="_blank" rel="noreferrer">
              Walk there <span aria-hidden="true">↗</span>
            </a>
            <a className="button" href={placeUrl(lat, lng)} target="_blank" rel="noreferrer">
              View on Maps <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <nav className="work-page__pager" aria-label="More works">
          <Link to={`/works/${prev.slug}`} rel="prev" className="pager-card" viewTransition>
            <span className="meta">← Previous</span>
            <span className="display display--s">{prev.title}</span>
          </Link>
          <Link to={`/works/${next.slug}`} rel="next" className="pager-card" viewTransition>
            <span className="meta">Next →</span>
            <span className="display display--s">{next.title}</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
