import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { RunningRabbit } from './RunningRabbit.tsx';
import './CloudCurtain.css';

/** Short loads never flash the curtain; once closed it stays long enough to read as intentional. */
const CLOSE_DELAY_MS = 120;
const MIN_CLOSED_MS = 600;

const CLOUD = '/media/cloud.webp';

/**
 * Cloud sprites per wall: [top %, width vmax, inset from the inner edge (vmax, negative = overhang), flip].
 * Hand-placed so the bank is dense where the walls meet and the seam never shows.
 */
const EDGE: Array<[number, number, number, boolean]> = [
  [-14, 62, -26, false],
  [4, 50, -18, true],
  [18, 66, -30, false],
  [36, 54, -20, true],
  [50, 64, -28, false],
  [66, 52, -18, true],
  [80, 66, -30, false],
  [96, 58, -22, true],
];
const BODY: Array<[number, number, number, boolean]> = [
  [-6, 70, 18, true],
  [30, 74, 24, false],
  [62, 70, 14, true],
  [90, 76, 22, false],
];

function Wall({ side }: { side: 'left' | 'right' }) {
  const sprite = ([top, width, inset, flip]: [number, number, number, boolean], i: number, kind: string) => (
    <img
      key={`${kind}-${i}`}
      src={CLOUD}
      alt=""
      draggable={false}
      className={`curtain__cloud curtain__cloud--${kind}`}
      style={
        {
          '--top': `${top}%`,
          '--w': `${width}vmax`,
          '--inset': `${inset}vmax`,
          '--flip': flip ? -1 : 1,
          '--n': i,
        } as CSSProperties
      }
    />
  );
  return (
    <div className={`curtain__wall curtain__wall--${side}`}>
      {BODY.map((c, i) => sprite(c, i, 'body'))}
      {EDGE.map((c, i) => sprite(c, i, 'edge'))}
    </div>
  );
}

/**
 * Clash-of-Clans-style loading: two walls of cloud slide together over the screen, the rabbit runs
 * across them while a dream loads, then they part to reveal it.
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
      <Wall side="left" />
      <Wall side="right" />
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
