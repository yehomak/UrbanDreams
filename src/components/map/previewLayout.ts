/**
 * Geometry of the anchored preview, computed from the viewport (never measured from the animating card):
 * the selected pin always comes to rest at (anchorX, anchorY) and the card sits right above it.
 */
export const PREVIEW = {
  /** Pin centre → card bottom: room for the pin and the 12px tail. */
  gap: 38,
  /** Title row under the artwork. */
  titleH: 52,
  /** Card padding around the artwork. */
  pad: 8,
  maxDesktop: 340,
  maxPhoneVw: 0.76,
  min: 200,
} as const;

export function previewLayout(aspect = 0.75) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const phone = W <= 640;
  const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 80;
  // Low and centred: on phones within thumb reach
  const anchorY = phone ? H - 110 : H - 150;
  const room = anchorY - PREVIEW.gap - (header + 16) - PREVIEW.titleH - PREVIEW.pad * 2;
  const imageW = Math.max(PREVIEW.min, Math.min(phone ? W * PREVIEW.maxPhoneVw : PREVIEW.maxDesktop, room * aspect));
  return { W, H, anchorX: W / 2, anchorY, width: Math.round(imageW + PREVIEW.pad * 2) };
}

/** CSS-style cubic-bezier easing for MapLibre's camera. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bez = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = bez(t, x1, x2) - x;
      const d = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t ** 2;
      if (Math.abs(dx) < 1e-5 || d === 0) break;
      t = Math.min(1, Math.max(0, t - dx / d));
    }
    return bez(t, y1, y2);
  };
}
