import { useEffect } from 'react';
import { Link } from 'react-router';
import { districtName, neighbours, workNumber, type Work } from '@/content/works.ts';
import { directionsUrl } from '@/content/geo.ts';
import { WorkImage } from '../WorkImage.tsx';
import './WorkPreview.css';

interface Props {
  work: Work;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

/** Bottom sheet on phones, floating side card on desktop. */
export function WorkPreview({ work, onClose, onNavigate }: Props) {
  const { prev, next } = neighbours(work);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate(next.slug);
      if (e.key === 'ArrowLeft') onNavigate(prev.slug);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNavigate, prev.slug, next.slug]);

  return (
    <aside className="preview" aria-label={`${work.title}, preview`} data-testid="work-preview" key={work.slug}>
      <button className="preview__close" onClick={onClose} aria-label="Close preview">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <Link to={`/works/${work.slug}`} className="preview__media" viewTransition>
        <WorkImage work={work} variant="full" priority posterUnderlay />
      </Link>

      <div className="preview__body">
        <p className="eyebrow">
          {workNumber(work)} · {work.style}
        </p>
        <h2 className="preview__title display">{work.title}</h2>
        <p className="preview__meta">
          {districtName(work.location.district)} · {work.mood.time} · {work.mood.atmosphere}
        </p>

        <div className="preview__actions">
          <Link to={`/works/${work.slug}`} className="button button--primary" viewTransition>
            Open work
          </Link>
          <a className="button" href={directionsUrl(work.location.lat, work.location.lng)} target="_blank" rel="noreferrer">
            Walk there ↗
          </a>
        </div>

        <div className="preview__stepper">
          <button className="button button--ghost" onClick={() => onNavigate(prev.slug)} aria-label={`Previous: ${prev.title}`}>
            ← {prev.title}
          </button>
          <button className="button button--ghost" onClick={() => onNavigate(next.slug)} aria-label={`Next: ${next.title}`}>
            {next.title} →
          </button>
        </div>
      </div>
    </aside>
  );
}
