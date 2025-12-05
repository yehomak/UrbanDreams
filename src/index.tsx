// src/main.tsx
import { AppConfigProvider } from '@/appConfig';
// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root';
import { EnvUnsupported } from '@/components/EnvUnsupported';
import { init, type InitConfig } from '@/init';

import './css/index.css';

// Mock the environment in case, we are outside Telegram.
// import './mockEnv.ts';

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');
const root = ReactDOM.createRoot(container);

(async () => {
  try {
    // Pull nickname + flags from init() (launch params + overrides inside init)
    const cfg: InitConfig = await init({
      // You can optionally override defaults here; otherwise init() resolves from launch params.
      // debug: false,
      eruda: true,
      // mockForMacOS: false,
    });

    root.render(
      <StrictMode>
        <AppConfigProvider value={cfg}>
          <Root />
        </AppConfigProvider>
      </StrictMode>
    );
  } catch (e) {
    console.error('App init failed:', e);
    root.render(<EnvUnsupported />);
  }
})();
