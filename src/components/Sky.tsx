import { useEffect, useRef } from 'react';
import './Sky.css';

/** Cleaned original cloud + two silhouettes derived from it (scripts/cloud-sprites.ts). */
const CLOUD_SRCS = ['/media/clouds/cloud-a.webp', '/media/clouds/cloud-b.webp', '/media/clouds/cloud-c.webp'];

export type SkyMode = 'dense' | 'ambient' | 'off';

/** The map's sky: the original 21 clouds plus a few more, at 35%. Loading adds more and thickens them all. */
const AMBIENT_COUNT = 25;
const TOTAL_COUNT = 48;
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
      const [sizeMin, sizeMax] = small ? [220, 380] : [260, 520];
      // Slower than the original (45px/s): the fastest clouds drifted by too quickly
      const speedMax = small ? 18 : 28;
      const rand = xorshift(1337);
      const previous = clouds;
      clouds = Array.from({ length: TOTAL_COUNT }, (_, i) => {
        const size = sizeMin + rand() * (sizeMax - sizeMin);
        return {
          size,
          sprite: Math.floor(rand() * sprites.length),
          flip: rand() > 0.5,
          stretch: 0.8 + rand() * 0.35,
          speed: 5 + rand() * (speedMax - 5),
          y: rand(),
          phase: rand() * (width + size) - size,
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
        const span = width + c.size;
        let x = (c.phase + c.speed * clock) % span;
        if (x < 0) x += span;
        const img = sprites[c.sprite]!;
        const h = c.size * (img.naturalHeight / img.naturalWidth) * c.stretch;
        const top = c.y * (height + h * 0.4) - h * 0.7;
        ctx.globalAlpha = c.alpha;
        if (c.flip) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(img, -(x - c.size) - c.size, top, c.size, h);
          ctx.restore();
        } else {
          ctx.drawImage(img, x - c.size, top, c.size, h);
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
