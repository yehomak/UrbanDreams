import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CloudLayer } from '../map/CloudLayer.tsx';
import { RunningRabbit } from './RunningRabbit.tsx';
import './CloudCurtain.css';

/** Short loads never flash the sky; once shown it stays long enough to read as intentional. */
const SHOW_DELAY_MS = 120;
const MIN_SHOWN_MS = 600;
/** Must match the fade-out duration in CloudCurtain.css. */
const FADE_MS = 900;

/**
 * Loading screen: the same slow white clouds that drift over the map, on a dusk sky, with the
 * original running rabbit. When the dream is ready the whole sky simply dissolves.
 */
export function CloudCurtain({ active, children }: { active: boolean; children?: ReactNode }) {
  const [shown, setShown] = useState(active);
  // Keep the cloud canvas alive through the fade, then unmount it so nothing animates off-screen
  const [mounted, setMounted] = useState(active);
  // Boot starts shown at t=0; its own 700ms minimum lives in Layout
  const shownAt = useRef(0);

  useEffect(() => {
    if (active && !shown) {
      const t = window.setTimeout(() => {
        shownAt.current = performance.now();
        setMounted(true);
        setShown(true);
      }, SHOW_DELAY_MS);
      return () => window.clearTimeout(t);
    }
    if (!active && shown) {
      const wait = Math.max(0, shownAt.current + MIN_SHOWN_MS - performance.now());
      const t = window.setTimeout(() => setShown(false), wait);
      return () => window.clearTimeout(t);
    }
    if (!shown && mounted) {
      const t = window.setTimeout(() => setMounted(false), FADE_MS);
      return () => window.clearTimeout(t);
    }
  }, [active, shown, mounted]);

  return (
    <div className="curtain" data-state={shown ? 'closed' : 'open'} data-testid="curtain" aria-hidden={!shown}>
      {mounted && (
        <>
          <CloudLayer opacity={0.5} />
          <div className="curtain__center" role="status" aria-live="polite">
            <RunningRabbit />
            <p className="curtain__caption">{children ?? 'Drifting into the dream…'}</p>
          </div>
        </>
      )}
    </div>
  );
}
