// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import eruda from 'eruda';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import './css/index.css';

// Mock the environment in case, we are outside Telegram.
//import './mockEnv.ts';

eruda.init();
eruda.position({ x: window.innerWidth - 50, y: 0 });

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  await init({
    debug: false,
    eruda: false,
    mockForMacOS: false,
  })
    .then(() => {
      console.log('here');
      root.render(
        <StrictMode>
          <Root/>
        </StrictMode>,
      );
    });
} catch (e) {
  root.render(<EnvUnsupported/>);
}
