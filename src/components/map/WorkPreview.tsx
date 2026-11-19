import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { neighbours, workNumber, type Work } from '@/content/works.ts';
import { WorkImage } from '../WorkImage.tsx';
import { isPlainKey } from '@/lib/keys.ts';
import { pinAnchor } from '@/lib/pinAnchor.ts';
import { artworkTransitionName } from '@/lib/viewTransition.ts';
import { PREVIEW, previewLayout } from './previewLayout.ts';
import './WorkPreview.css';

interface Props {
  /** The selected work, or null when nothing is selected. */
  work: Work | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

const UNFOLD = { duration: 360, easing: 'cubic-bezier(0.2, 0, 0, 1)' };
const FOLD = { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)' };
const GUTTER = 12;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The anchored preview: a card that lives right above its pin, with a little tail pointing at it.
 * It unfolds as a circle growing out of the pin's centre once the camera has brought the pin to the
 * anchor point, stays attached while the map moves, and folds back into the pin when closed or when
 * another work is chosen. The whole card opens the work.
 */
export function WorkPreview({ work, onClose, onNavigate }: Props) {
  // What is on screen. Lags `work` while the old card folds away.
  const [shown, setShown] = useState<Work | null>(work);
  const wrapRef = useRef<HTMLElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const close = useEffectEvent(() => onClose());

  /** Pin position relative to the card's box: the origin of every fold and unfold. */
  const originOf = () => {
    const box = wrapRef.current!.getBoundingClientRect();
    const { x, y } = pinAnchor.get();
    return { ox: x - box.left, oy: y - box.top, r: Math.hypot(box.width, box.height + PREVIEW.gap) };
  };

  /** Fold the current card back into its pin. Resolves when done (or at once if nothing is shown). */
  const fold = (): Promise<void> => {
    const clip = clipRef.current;
    if (!clip || wrapRef.current?.style.visibility === 'hidden') return Promise.resolve();
    const { ox, oy, r } = originOf();
    clip.getAnimations().forEach((a) => a.cancel());
    const anim = reducedMotion()
      ? clip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' })
      : clip.animate(
          [
            { clipPath: `circle(${r}px at ${ox}px ${oy}px)`, transform: 'scale(1)', opacity: 1 },
            { clipPath: `circle(0px at ${ox}px ${oy}px)`, transform: 'scale(0.94)', opacity: 0 },
          ],
          { ...FOLD, fill: 'forwards' },
        );
    return anim.finished.then(
      () => undefined,
      () => undefined,
    );
  };

  // Follow the selection: fold the old card into its pin, then show the new one
  useEffect(() => {
    if (work?.slug === shown?.slug) return;
    let cancelled = false;
    fold().then(() => {
      if (!cancelled) setShown(work);
    });
    return () => {
      cancelled = true;
    };
    // fold() only reads refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work, shown]);

  // Attach the shown card to its pin and unfold it out of the pin's centre
  useLayoutEffect(() => {
    if (!shown) return;
    const wrap = wrapRef.current!;
    const clip = clipRef.current!;
    const tail = tailRef.current!;
    wrap.style.width = `${previewLayout(shown.media.aspect).width}px`;
    wrap.style.visibility = 'hidden';
    clip.getAnimations().forEach((a) => a.cancel());

    const place = () => {
      const { x, y, slug } = pinAnchor.get();
      if (slug !== shown.slug) return;
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      const W = window.innerWidth;
      const left = Math.min(Math.max(x - w / 2, GUTTER), W - GUTTER - w);
      const top = y - PREVIEW.gap - h;
      wrap.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      // The tail keeps pointing at the pin even when the card is clamped to the screen edge
      tail.style.left = `${Math.min(Math.max(x - left, 26), w - 26)}px`;
      // Pin dragged well off screen: let the card go
      if (x < -40 || x > W + 40 || y < -40 || y > window.innerHeight + 40) close();
    };
    const unsubscribe = pinAnchor.subscribe(place);
    place();

    const unfold = () => {
      place();
      wrap.style.visibility = '';
      const { ox, oy, r } = originOf();
      clip.style.transformOrigin = `${ox}px ${oy}px`;
      const done = () => linkRef.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
      if (reducedMotion()) {
        clip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 }).finished.then(done, () => {});
        return;
      }
      clip
        .animate(
          [
            { clipPath: `circle(0px at ${ox}px ${oy}px)`, transform: 'scale(0.94)', opacity: 0 },
            { opacity: 1, offset: 0.22 },
            { clipPath: `circle(${r}px at ${ox}px ${oy}px)`, transform: 'scale(1)', opacity: 1 },
          ],
          UNFOLD,
        )
        .finished.then(done, () => {});
      titleRef.current?.animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 180, delay: 140, easing: 'ease-out', fill: 'backwards' },
      );
    };
    const timer = window.setTimeout(unfold, Math.max(0, pinAnchor.get().unfoldAt - performance.now()));
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [shown]);

  // Keyboard: Escape closes, ← / → step through the works
  useEffect(() => {
    if (!shown) return;
    const { prev, next } = neighbours(shown);
    const onKey = (e: KeyboardEvent) => {
      if (!isPlainKey(e)) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate(next.slug);
      if (e.key === 'ArrowLeft') onNavigate(prev.slug);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown, onClose, onNavigate]);

  if (!shown) return null;

  return (
    <aside
      ref={wrapRef}
      className="preview"
      aria-label={`${shown.title}, preview`}
      data-testid="work-preview"
      style={{ '--aspect': shown.media.aspect } as CSSProperties}
    >
      <div ref={clipRef} className="preview__clip">
        <Link ref={linkRef} to={`/works/${shown.slug}`} className="preview__card" viewTransition>
          <div className="preview__media" style={{ viewTransitionName: artworkTransitionName(shown.slug) }}>
            <WorkImage key={shown.slug} work={shown} variant="full" priority posterUnderlay />
          </div>
          <h2 ref={titleRef} className="preview__title display display--s">
            {workNumber(shown)} {shown.title}
          </h2>
        </Link>
        <span ref={tailRef} className="preview__tail" aria-hidden="true" />
      </div>
    </aside>
  );
}
