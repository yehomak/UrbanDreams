import { createContext, useContext, useEffect } from 'react';

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
