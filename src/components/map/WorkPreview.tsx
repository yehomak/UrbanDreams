import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { districtName, neighbours, workNumber, works, type Work } from '@/content/works.ts';
import { directionsUrl } from '@/content/geo.ts';
import { WorkImage } from '../WorkImage.tsx';
import { isPlainKey } from '@/lib/keys.ts';
import { artworkTransitionName } from '@/lib/viewTransition.ts';
import './WorkPreview.css';

interface Props {
  work: Work;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

/** Bottom sheet on phones, floating side card on desktop. */
export function WorkPreview({ work, onClose, onNavigate }: Props) {
  const { prev, next } = neighbours(work);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus into the panel when it opens (not on every step, so stepper buttons keep focus)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlainKey(e)) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate(next.slug);
      if (e.key === 'ArrowLeft') onNavigate(prev.slug);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNavigate, prev.slug, next.slug]);

  return (
    <aside className="preview surface surface--raised" aria-label={`${work.title}, preview`} data-testid="work-preview">
      <button className="preview__close" onClick={onClose} aria-label="Close preview">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <Link
        to={`/works/${work.slug}`}
        className="preview__media"
        style={{ '--poster': `url(${work.media.poster})`, viewTransitionName: artworkTransitionName(work.slug) } as CSSProperties}
        aria-label={`Open ${work.title}`}
        viewTransition
      >
        <WorkImage key={work.slug} work={work} variant="full" priority posterUnderlay />
      </Link>

      <div className="preview__body">
        <div className="preview__text swap-in" key={work.slug}>
          <p className="meta">
            <span className="meta__accent">{workNumber(work)}</span>
            <span>{work.style}</span>
          </p>
          <h2 className="preview__title display display--m" ref={headingRef} tabIndex={-1}>
            {work.title}
          </h2>
          <p className="preview__mood">
            {districtName(work.location.district)}, {work.mood.time.toLowerCase()}, {work.mood.atmosphere.toLowerCase()}
          </p>
        </div>

        <div className="preview__actions">
          <Link to={`/works/${work.slug}`} className="button button--primary" viewTransition>
            Open work
          </Link>
          <a className="button" href={directionsUrl(work.location.lat, work.location.lng)} target="_blank" rel="noreferrer">
            Walk there <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="preview__stepper">
          <button className="stepper__btn" onClick={() => onNavigate(prev.slug)} aria-label={`Previous: ${prev.title}`}>
            <span aria-hidden="true">←</span>
          </button>
          <span className="meta stepper__count" aria-hidden="true">
            {String(work.id + 1).padStart(2, '0')} / {works.length}
          </span>
          <button className="stepper__btn" onClick={() => onNavigate(next.slug)} aria-label={`Next: ${next.title}`}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
