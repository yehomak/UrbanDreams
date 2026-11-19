import { useEffect, useRef } from 'react';

const CLOUD_SRC = '/media/cloud.webp';

interface Cloud {
  y: number;
  size: number;
  speed: number;
  phase: number;
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
 * Slow clouds drifting over the city. A single canvas, one sprite, ~20 draw calls per frame.
 * Pauses when the tab is hidden, freezes for reduced-motion users.
 */
export function CloudLayer({ count = 18, opacity = 0.32 }: { count?: number; opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const sprite = new Image();
    sprite.src = CLOUD_SRC;

    let clouds: Cloud[] = [];
    let width = 0;
    let height = 0;
    let aspect = 0.67;
    let raf = 0;
    let start = performance.now();

    const layout = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = width <= 640;
      const rand = xorshift(1337);
      // Phones get a thinner sky so the streets stay readable
      clouds = Array.from({ length: small ? Math.ceil(count / 2) : count }, () => {
        const size = (small ? 280 : 360) + rand() * (small ? 160 : 260);
        return {
          size,
          speed: 5 + rand() * (small ? 18 : 36),
          y: rand() * Math.max(1, height - size * aspect * 0.6) - size * aspect * 0.2,
          phase: rand() * (width + size) - size,
        };
      });
    };

    const draw = (now: number) => {
      const t = reduced ? 0 : (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = width <= 640 ? opacity * 0.7 : opacity;
      for (const c of clouds) {
        const span = width + c.size;
        let x = (c.phase + c.speed * t) % span;
        if (x < 0) x += span;
        ctx.drawImage(sprite, x - c.size, c.y, c.size, c.size * aspect);
      }
    };

    const loop = (now: number) => {
      if (document.visibilityState === 'visible') draw(now);
      raf = requestAnimationFrame(loop);
    };

    const observer = new ResizeObserver(() => {
      layout();
      if (reduced) draw(0);
    });

    sprite
      .decode()
      .then(() => {
        aspect = sprite.naturalHeight / sprite.naturalWidth || aspect;
        layout();
        observer.observe(canvas);
        start = performance.now();
        if (reduced) draw(0);
        else raf = requestAnimationFrame(loop);
      })
      .catch(() => {
        /* No clouds is fine: the map still works. */
      });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [count, opacity]);

  return <canvas ref={canvasRef} className="cloud-layer" aria-hidden="true" />;
}
