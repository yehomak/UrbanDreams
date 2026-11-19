import type { CSSProperties, ReactNode } from 'react';
import { RunningRabbit } from './RunningRabbit.tsx';
import './CloudCurtain.css';

/** Four little clouds around the rabbit (position of each cloud's centre within the stage). */
const LITTLE_CLOUDS = [
  { src: '/media/clouds/cloud-b.webp', x: '18%', y: '22%', w: '200px' },
  { src: '/media/clouds/cloud-a.webp', x: '86%', y: '34%', w: '150px' },
  { src: '/media/clouds/cloud-c.webp', x: '12%', y: '82%', w: '130px' },
  { src: '/media/clouds/cloud-a.webp', x: '80%', y: '86%', w: '180px' },
];

/**
 * Loading screen: the plain dusk backdrop, the white rabbit and a few little clouds around it.
 * The map's own sky only gathers after this has faded.
 */
export function CloudCurtain({ shown, children }: { shown: boolean; children?: ReactNode }) {
  return (
    <div className="curtain" data-state={shown ? 'closed' : 'open'} data-testid="curtain" aria-hidden={!shown}>
      <div className="curtain__backdrop" />
      <div className="curtain__center" role="status" aria-live="polite">
        {shown && (
          <>
            <div className="curtain__stage">
              {LITTLE_CLOUDS.map((c, i) => (
                <img
                  key={i}
                  src={c.src}
                  alt=""
                  draggable={false}
                  className="curtain__cloud"
                  style={{ '--x': c.x, '--y': c.y, '--w': c.w, '--i': i } as CSSProperties}
                />
              ))}
              <RunningRabbit />
            </div>
            <p className="visually-hidden">{children ?? 'Loading…'}</p>
          </>
        )}
      </div>
    </div>
  );
}
