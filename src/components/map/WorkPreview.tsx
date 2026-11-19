import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { neighbours, workNumber, type Work } from '@/content/works.ts';
import { WorkImage } from '../WorkImage.tsx';
import { isPlainKey } from '@/lib/keys.ts';
import { artworkTransitionName } from '@/lib/viewTransition.ts';
import './WorkPreview.css';

interface Props {
  work: Work;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

/**
 * The minimal preview: the artwork and its title, nothing else. The whole card opens the work.
 * Close by clicking the map or pressing Escape; ← / → step through the works.
 */
export function WorkPreview({ work, onClose, onNavigate }: Props) {
  const { prev, next } = neighbours(work);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Focus the card when it opens, so Enter opens the work; no ring unless the visitor is on a keyboard
  useEffect(() => {
    linkRef.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
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
    <aside
      className="preview"
      aria-label={`${work.title}, preview`}
      data-testid="work-preview"
      style={{ '--aspect': work.media.aspect } as CSSProperties}
    >
      <Link ref={linkRef} to={`/works/${work.slug}`} className="preview__card surface surface--raised" viewTransition>
        <div className="preview__media" style={{ viewTransitionName: artworkTransitionName(work.slug) }}>
          <WorkImage key={work.slug} work={work} variant="full" priority posterUnderlay />
        </div>
        <h2 className="preview__title display display--s" key={`t-${work.slug}`}>
          {workNumber(work)} {work.title}
        </h2>
      </Link>
    </aside>
  );
}
