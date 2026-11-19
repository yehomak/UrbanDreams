import { useState, type CSSProperties } from 'react';
import type { Work } from '@/content/works.ts';

type Variant = 'full' | 'poster' | 'thumb';
type State = 'loading' | 'loaded' | 'error';

interface Props {
  work: Work;
  variant: Variant;
  className?: string;
  /** Load eagerly and with high priority (above-the-fold hero). */
  priority?: boolean;
  /** Show the still poster underneath while the animated full image decodes. */
  posterUnderlay?: boolean;
}

/**
 * Every artwork image in the app goes through here: reserved aspect ratio (no layout shift),
 * shimmer while loading, graceful fallback when a file is missing.
 */
export function WorkImage({ work, variant, className, priority, posterUnderlay }: Props) {
  const [state, setState] = useState<State>('loading');
  const src = work.media[variant];
  const style = { aspectRatio: variant === 'thumb' ? '1' : String(work.media.aspect) } as CSSProperties;
  if (posterUnderlay && variant === 'full') {
    // Same framing as the <img> (object-fit: contain) so nothing jumps when the animation arrives
    style.background = `var(--ink-0) url(${work.media.poster}) center / contain no-repeat`;
  }

  return (
    <div className={`media-frame ${className ?? ''}`} data-state={state} style={style}>
      {state !== 'error' && (
        <img
          // Re-mount on src change so load state resets cleanly
          key={src}
          src={src}
          alt={`${work.title} — ${work.style} rendering of a street in ${work.location.district}, Warsaw`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
          ref={(img) => {
            // Cached images can finish before React attaches onLoad
            if (img?.complete && img.naturalWidth > 0) setState('loaded');
          }}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}
      {state === 'error' && (
        <div className="media-frame__fallback" role="img" aria-label={`${work.title} (image unavailable)`}>
          {work.marker}
        </div>
      )}
    </div>
  );
}
