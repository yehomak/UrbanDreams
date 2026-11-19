import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { RunningRabbit } from './RunningRabbit.tsx';
import './CloudCurtain.css';

/** Short loads never flash the curtain; once closed it stays long enough to read as intentional. */
const CLOSE_DELAY_MS = 120;
const MIN_CLOSED_MS = 600;

const CLOUD = '/media/cloud.webp';

interface Cloud {
  x: number; // centre, % of viewport width
  y: number; // centre, % of viewport height
  w: number; // width, vmax
  dx: number; // where it drifts to when the sky clears, vmax
  dy: number;
  delay: number; // ms
  dur: number; // ms
  flip: boolean;
}

/** Deterministic PRNG: the same sky every time. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * A sky of individual clouds on a jittered grid. Each one drifts away from the centre along its own
 * line, at its own speed and after its own pause, so the sky clears unevenly, like weather.
 */
const SKY: Cloud[] = (() => {
  const r = rng(7);
  const clouds: Cloud[] = [];
  const cols = 5;
  const rows = 6;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = ((col + 0.5) / cols) * 100 + (r() - 0.5) * 16;
      const y = ((row + 0.5) / rows) * 100 + (r() - 0.5) * 12;
      // Away from the centre with a little wobble; the middle clouds pick a random way out
      let ax = x - 50 + (r() - 0.5) * 30;
      let ay = y - 50 + (r() - 0.5) * 30;
      const len = Math.hypot(ax, ay) || 1;
      ax /= len;
      ay /= len;
      const dist = 70 + r() * 60;
      clouds.push({
        x,
        y,
        w: 42 + r() * 34,
        dx: ax * dist,
        dy: ay * dist * 0.8,
        delay: Math.round(r() * 450),
        dur: Math.round(1100 + r() * 900),
        flip: r() > 0.5,
      });
    }
  }
  return clouds;
})();

/**
 * Clash-of-Clans-style loading: clouds gather over the screen while a dream loads, the white rabbit
 * hops across them, and then the sky clears, unevenly, cloud by cloud.
 */
export function CloudCurtain({ active, children }: { active: boolean; children?: ReactNode }) {
  const [closed, setClosed] = useState(active);
  // Boot starts closed at t=0; its own 700ms minimum lives in Layout
  const closedAt = useRef(0);

  useEffect(() => {
    if (active && !closed) {
      const t = window.setTimeout(() => {
        closedAt.current = performance.now();
        setClosed(true);
      }, CLOSE_DELAY_MS);
      return () => window.clearTimeout(t);
    }
    if (!active && closed) {
      const wait = Math.max(0, closedAt.current + MIN_CLOSED_MS - performance.now());
      const t = window.setTimeout(() => setClosed(false), wait);
      return () => window.clearTimeout(t);
    }
  }, [active, closed]);

  return (
    <div className="curtain" data-state={closed ? 'closed' : 'open'} data-testid="curtain" aria-hidden={!closed}>
      <div className="curtain__fog" />
      {SKY.map((c, i) => (
        <img
          key={i}
          src={CLOUD}
          alt=""
          draggable={false}
          className="curtain__cloud"
          style={
            {
              '--x': `${c.x}%`,
              '--y': `${c.y}%`,
              '--w': `${c.w}vmax`,
              '--dx': `${c.dx}vmax`,
              '--dy': `${c.dy}vmax`,
              '--delay': `${c.delay}ms`,
              '--dur': `${c.dur}ms`,
              '--flip': c.flip ? -1 : 1,
            } as CSSProperties
          }
        />
      ))}
      <div className="curtain__center" role="status" aria-live="polite">
        {closed && (
          <>
            <RunningRabbit />
            <p className="curtain__caption">{children ?? 'Drifting into the dream…'}</p>
          </>
        )}
      </div>
    </div>
  );
}
