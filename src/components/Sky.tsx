import { useEffect, useRef } from 'react';
import { skyCamera } from '@/lib/skyCamera.ts';
import './Sky.css';

/** Cleaned original cloud + two silhouettes derived from it (scripts/cloud-sprites.ts). */
const CLOUD_SRCS = ['/media/clouds/cloud-a.webp', '/media/clouds/cloud-b.webp', '/media/clouds/cloud-c.webp'];

export type SkyMode = 'dense' | 'ambient' | 'off';

/** The map's sky: 45 big clouds at 35%, about two thirds of the screen. Loading adds more and thickens them all. */
const AMBIENT_COUNT = 45;
const TOTAL_COUNT = 60;
const ALPHA = { dense: 0.85, ambient: 0.35, off: 0 } as const;

interface Cloud {
  y: number; // fraction of height
  size: number; // width, px
  sprite: number;
  flip: boolean;
  stretch: number; // vertical squash/stretch, so no two clouds share a silhouette
  speed: number;
  phase: number;
  /** How quickly this cloud reacts when the sky changes (s): uneven, like weather. */
  tau: number;
  alpha: number;
}

/** Deterministic PRNG so the sky looks the same on every visit. */
function xorshift(seed: number) {
  let s = seed;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/**
 * One sky for the whole app: a single full-screen canvas above the map and the header.
 * It thickens while a dream loads and thins to the original ambient clouds on the map,
 * so clouds never disappear and reappear. Each cloud changes at its own pace.
 */
export function Sky({ mode }: { mode: SkyMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    modeRef.current = mode;
    wakeRef.current();
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const sprites = CLOUD_SRCS.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let clouds: Cloud[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let cancelled = false;
    let sizeMaxNow = 780;
    let ready = false;

    const target = (i: number) => {
      const m = modeRef.current;
      if (m === 'ambient') return i < AMBIENT_COUNT ? ALPHA.ambient : 0;
      return ALPHA[m];
    };

    // Sizes, speeds and spread from the first version of the app
    const layout = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = width <= 430;
      const [sizeMin, sizeMax] = small ? [230, 400] : [400, 780];
      sizeMaxNow = sizeMax;
      // Slower than the original (45px/s): the fastest clouds drifted by too quickly
      const speedMax = small ? 18 : 28;
      const rand = xorshift(1337);
      const previous = clouds;
      // Even spacing: each new cloud takes the best of several random spots, the one farthest from the
      // clouds already placed (on a wrap-around sky, x weighted by the screen's aspect), so none clump.
      const ratio = width / Math.max(1, height);
      const placed: Array<[number, number]> = [];
      const spot = (): [number, number] => {
        let best: [number, number] = [rand(), rand()];
        let bestD = -1;
        for (let k = 0; k < 14; k++) {
          const c: [number, number] = [rand(), rand()];
          let d = Infinity;
          for (const [px, py] of placed) {
            const dx = Math.min(Math.abs(c[0] - px), 1 - Math.abs(c[0] - px)) * ratio;
            const dy = Math.abs(c[1] - py);
            d = Math.min(d, dx * dx + dy * dy);
          }
          if (d > bestD) [best, bestD] = [c, d];
        }
        placed.push(best);
        return best;
      };
      clouds = Array.from({ length: TOTAL_COUNT }, (_, i) => {
        const size = sizeMin + rand() * (sizeMax - sizeMin);
        const [u, v] = spot();
        return {
          size,
          sprite: Math.floor(rand() * sprites.length),
          flip: rand() > 0.5,
          stretch: 0.8 + rand() * 0.35,
          // A narrow speed band so neighbours keep their distance for longer
          speed: speedMax * (0.6 + rand() * 0.4),
          y: v,
          phase: u * (width + size) - size,
          tau: 0.25 + rand() * 0.9,
          // First paint starts fully formed (no thin sky while booting); later layouts keep current alpha
          alpha: previous[i]?.alpha ?? target(i),
        };
      });
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (!reduced) clock += dt;
      ctx.clearRect(0, 0, width, height);
      let settled = true;
      clouds.forEach((c, i) => {
        const goal = target(i);
        // Leaving the map, the sky clears twice as fast as it gathers
        const tau = modeRef.current === 'off' ? c.tau * 0.5 : c.tau;
        c.alpha = reduced ? goal : c.alpha + (goal - c.alpha) * (1 - Math.exp(-dt / tau));
        if (Math.abs(goal - c.alpha) > 0.003) settled = false;
        if (c.alpha < 0.003) return;
        const img = sprites[c.sprite]!;
        const h = c.size * (img.naturalHeight / img.naturalWidth) * c.stretch;
        // Position on an endlessly repeating sky tile ("ground" pixels at the moment the map was bound)
        const tileW = width + sizeMaxNow;
        const tileH = height + sizeMaxNow;
        let bx = (c.phase + c.speed * clock) % tileW;
        if (bx < 0) bx += tileW;
        bx -= c.size;
        const by = c.y * tileH - h * 0.6;
        // Follow the map: pan exactly with the ground; positions scale with zoom, clouds a little less
        // (they float above the city), which reads as gentle depth
        const { px, py, qx, qy, k } = skyCamera;
        const grow = Math.sqrt(k);
        const w = c.size * grow;
        const hh = h * grow;
        const toX = (x: number) => qx + (x - px) * k;
        const toY = (y: number) => qy + (y - py) * k;
        const i0 = Math.ceil(((-w - qx) / k + px - bx) / tileW);
        const i1 = Math.floor(((width - qx) / k + px - bx) / tileW);
        const j0 = Math.ceil(((-hh - qy) / k + py - by) / tileH);
        const j1 = Math.floor(((height - qy) / k + py - by) / tileH);
        // Zoomed out, more sky fits on screen: thin each cloud so the whole stays as airy as before
        ctx.globalAlpha = c.alpha * Math.min(1, Math.max(0.45, k) ** 0.6);
        for (let i = i0; i <= i1; i++) {
          for (let j = j0; j <= j1; j++) {
            const x = toX(bx + i * tileW);
            const y = toY(by + j * tileH);
            if (c.flip) {
              ctx.save();
              ctx.translate(x + w, y);
              ctx.scale(-1, 1);
              ctx.drawImage(img, 0, 0, w, hh);
              ctx.restore();
            } else {
              ctx.drawImage(img, x, y, w, hh);
            }
          }
        }
      });
      // Nothing to draw and nothing changing: sleep until the mode changes
      if (settled && modeRef.current === 'off') {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (ready && !raf && !cancelled) raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const onResize = () => layout();
    window.addEventListener('resize', onResize, { passive: true });

    Promise.all(sprites.map((img) => img.decode()))
      .then(() => {
        if (cancelled) return;
        layout();
        ready = true;
        wake();
      })
      .catch(() => {
        /* No clouds is fine: everything else still works. */
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      for (const img of sprites) img.src = '';
    };
  }, []);

  return <canvas ref={canvasRef} className="sky" data-mode={mode} aria-hidden="true" />;
}
