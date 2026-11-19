/**
 * Where the selected pin is on screen, live, and when its card may unfold.
 * WorldMap writes it (on selection and on every map move); WorkPreview reads it to stay attached to the pin.
 */
export interface PinAnchor {
  slug: string | null;
  x: number;
  y: number;
  /** performance.now() timestamp at which the card should start unfolding (the camera is ~settled). */
  unfoldAt: number;
}

const state: PinAnchor = { slug: null, x: 0, y: 0, unfoldAt: 0 };
const listeners = new Set<() => void>();

export const pinAnchor = {
  get: (): Readonly<PinAnchor> => state,
  set(patch: Partial<PinAnchor>) {
    Object.assign(state, patch);
    for (const fn of listeners) fn();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
