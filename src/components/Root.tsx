import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';

import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { publicUrl } from '@/helpers/publicUrl.ts';

function ErrorBoundaryError({ error }: { error: unknown }) {
  console.error('Root boundary error:', error);
  
  return (
    <div style={{ padding: '1rem', color: 'red' }}>
      <h2>Critical Error</h2>
      <p>{String(error)}</p>
      <button onClick={() => window.location.reload()}>Reload App</button>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <TonConnectUIProvider
        manifestUrl={publicUrl('tonconnect-manifest.json')}
        uiPreferences={{ theme: THEME.DARK }}
      >
        <App/>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}
