import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { districtName, getWork, neighbours, workNumber } from '@/content/works.ts';
import { appleMapsUrl, directionsUrl } from '@/content/geo.ts';
import { WorkImage } from '@/components/WorkImage.tsx';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';
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
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') navigate(`/works/${next.slug}`, { viewTransition: true });
      if (e.key === 'ArrowLeft') navigate(`/works/${prev.slug}`, { viewTransition: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [work, navigate]);

  if (!work) return <NotFoundPage />;

  const { prev, next } = neighbours(work);
  const { lat, lng } = work.location;
  const facts = [
    ['Style', work.style],
    ['District', districtName(work.location.district)],
    ['Time', work.mood.time],
    ['Weather', work.mood.weather],
    ['Atmosphere', work.mood.atmosphere],
    ['Coordinates', `${lat.toFixed(5)}, ${lng.toFixed(5)}`],
  ] as const;

  return (
    <article className="page work-page" data-testid="work-page">
      <div className="work-page__media rise">
        <WorkImage work={work} variant="full" priority posterUnderlay />
      </div>

      <div className="work-page__info">
        <Link to="/works" className="work-page__back" viewTransition>
          ← All works
        </Link>
        <p className="eyebrow rise" style={{ ['--d' as string]: 1 }}>
          {workNumber(work)} · {work.style}
        </p>
        <h1 className="display work-page__title rise" style={{ ['--d' as string]: 2 }}>
          {work.title}
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

        <dl className="facts rise" style={{ ['--d' as string]: 4 }}>
          {facts.map(([k, v]) => (
            <div key={k} className="facts__row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="work-page__actions rise" style={{ ['--d' as string]: 5 }}>
          <a className="button button--primary" href={directionsUrl(lat, lng)} target="_blank" rel="noreferrer">
            Walk there ↗
          </a>
          <Link className="button" to={`/?work=${work.slug}`} viewTransition>
            Show on map
          </Link>
          <a className="button button--ghost" href={appleMapsUrl(lat, lng)} target="_blank" rel="noreferrer">
            Apple Maps ↗
          </a>
        </div>

        <nav className="work-page__pager" aria-label="More works">
          <Link to={`/works/${prev.slug}`} rel="prev" viewTransition>
            <span className="eyebrow">Previous</span>
            <span className="display">{prev.title}</span>
          </Link>
          <Link to={`/works/${next.slug}`} rel="next" viewTransition>
            <span className="eyebrow">Next</span>
            <span className="display">{next.title}</span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
