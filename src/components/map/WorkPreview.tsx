import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { neighbours, workNumber, type Work } from '@/content/works.ts';
import { WorkImage } from '../WorkImage.tsx';
import { isPlainKey } from '@/lib/keys.ts';
import { artworkTransitionName } from '@/lib/viewTransition.ts';
import './WorkPreview.css';

/** How long the card takes to grow out of the pin (the camera glide is 1.8s). */
const PREVIEW_BIRTH_MS = 1500;

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

  // The card is born from the pin: it starts as a tiny bubble on the pin, rides along with it while
  // the camera glides, and unfolds into place. The pin's position is read live every frame.
  useLayoutEffect(() => {
    const el = asideRef.current;
    const pin = document.querySelector<HTMLElement>(`[data-testid="pin-${work.slug}"]`);
    if (!el || !pin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.style.transform = '';
    const card = el.getBoundingClientRect(); // measured untransformed
    const cx = card.left + card.width / 2;
    const cy = card.top + card.height / 2;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / PREVIEW_BIRTH_MS);
      const e = ease(t);
      const p = pin.getBoundingClientRect();
      const dx = (p.left + p.width / 2 - cx) * (1 - e);
      const dy = (p.top + p.height / 2 - cy) * (1 - e);
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${0.06 + 0.94 * e})`;
      el.style.opacity = String(Math.min(1, t / 0.12));
      if (t < 1) raf = requestAnimationFrame(step);
      else el.style.transform = '';
    };
    el.style.opacity = '0';
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
      el.style.opacity = '';
    };
    // runs once per opening; stepping between works keeps the card in place
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
