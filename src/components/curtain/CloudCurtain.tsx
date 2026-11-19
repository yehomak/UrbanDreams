import type { ReactNode } from 'react';
import { RunningRabbit } from './RunningRabbit.tsx';
import './CloudCurtain.css';

/**
 * Loading screen: a dusk backdrop and the white rabbit. The clouds come from the shared <Sky>,
 * which thickens while this is shown and thins to the map's ambient clouds when it fades.
 */
export function CloudCurtain({ shown, children }: { shown: boolean; children?: ReactNode }) {
  return (
    <div className="curtain" data-state={shown ? 'closed' : 'open'} data-testid="curtain" aria-hidden={!shown}>
      <div className="curtain__backdrop" />
      <div className="curtain__center" role="status" aria-live="polite">
        {shown && (
          <>
            <RunningRabbit />
            <p className="visually-hidden">{children ?? 'Loading…'}</p>
          </>
        )}
      </div>
    </div>
  );
}
