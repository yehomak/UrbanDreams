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
export function CloudLayer({
  count = 21,
  opacity = 0.35,
  blend = 'normal',
}: {
  count?: number;
  opacity?: number;
  blend?: 'normal' | 'screen';
}) {
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
    let cancelled = false;

    // The original Urban Dreams sky: same count, sizes, speeds and opacity as the first version
    const layout = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = width <= 430;
      const sizes = small ? [200, 260, 320] : [240, 320, 400];
      const [sizeMin, sizeMax] = small ? [300, 450] : [360, 600];
      const speedMax = small ? 25 : 45;
      const nearest = (n: number) => sizes.reduce((p, c) => (Math.abs(c - n) < Math.abs(p - n) ? c : p), sizes[0]!);
      const rand = xorshift(1337);
      clouds = Array.from({ length: count }, () => {
        const size = nearest(sizeMin + rand() * (sizeMax - sizeMin));
        const speed = 5 + rand() * (speedMax - 5);
        const y = Math.round(rand() * Math.max(1, height - size * aspect));
        const phase = Math.round(rand() * (width + size)) - size;
        return { size, speed, y, phase };
      });
    };

    const draw = (now: number) => {
      const t = reduced ? 0 : (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = opacity;
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
        if (cancelled) return; // unmounted while the sprite was decoding
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
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      sprite.src = '';
    };
  }, [count, opacity]);

  return <canvas ref={canvasRef} className="cloud-layer" style={{ mixBlendMode: blend }} aria-hidden="true" />;
}
