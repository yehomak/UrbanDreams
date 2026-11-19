import type { ReactNode } from 'react';
import { RunningRabbit } from './RunningRabbit.tsx';
import './CloudCurtain.css';


/**
 * Loading screen: the plain dusk backdrop and the white rabbit with its own five little clouds.
 * The map's own sky only gathers after this has faded.
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
