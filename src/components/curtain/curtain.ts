import { createContext, useContext, useEffect, useRef, useState } from 'react';

/**
 * Anything that is "loading a dream" (first boot, the map's style and tiles, a slow route) holds the
 * cloud curtain closed by registering a hold. The curtain opens when the last hold is released.
 */
export interface CurtainApi {
  hold: (id: string) => void;
  release: (id: string) => void;
}

export const CurtainContext = createContext<CurtainApi>({ hold: () => {}, release: () => {} });

/** Keep the curtain closed while `active` is true. */
export function useCurtainHold(id: string, active: boolean) {
  const { hold, release } = useContext(CurtainContext);
  useEffect(() => {
    if (!active) return;
    hold(id);
    return () => release(id);
  }, [id, active, hold, release]);
}

/** Short loads never show the loader; once shown it stays long enough to read as intentional. */
const SHOW_DELAY_MS = 120;
const MIN_SHOWN_MS = 600;

/** `active`, debounced on the way in and held for a minimum on the way out. Starts as `active`. */
export function useDelayedFlag(active: boolean): boolean {
  const [shown, setShown] = useState(active);
  // Boot starts shown at t=0; its own minimum lives with the boot hold
  const shownAt = useRef(0);
  useEffect(() => {
    if (active && !shown) {
      const t = window.setTimeout(() => {
        shownAt.current = performance.now();
        setShown(true);
      }, SHOW_DELAY_MS);
      return () => window.clearTimeout(t);
    }
    if (!active && shown) {
      const wait = Math.max(0, shownAt.current + MIN_SHOWN_MS - performance.now());
      const t = window.setTimeout(() => setShown(false), wait);
      return () => window.clearTimeout(t);
    }
  }, [active, shown]);
  return shown;
}
