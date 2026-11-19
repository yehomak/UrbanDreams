import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
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
  const asideRef = useRef<HTMLElement>(null);

  // The card grows out of the pin: it starts as a small bubble where the camera is bringing the pin
  // (the centre of the free area beside / above the card) and unfolds into place as the pin arrives.
  useLayoutEffect(() => {
    const el = asideRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = el.getBoundingClientRect();
    const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
    const [W, H] = [window.innerWidth, window.innerHeight];
    // Mirrors freeAreaPadding() in WorldMap: where the selected pin ends up
    const [pinX, pinY] = card.width > W * 0.6 ? [W / 2, (header + card.top) / 2] : [card.left / 2, (header + H) / 2];
    const dx = pinX - (card.left + card.width / 2);
    const dy = pinY - (card.top + card.height / 2);
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0 },
        { transform: `translate(${dx * 0.85}px, ${dy * 0.85}px) scale(0.16)`, opacity: 1, offset: 0.18 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 950, delay: 700, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)', fill: 'backwards' },
    );
  }, []);

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
      ref={asideRef}
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
