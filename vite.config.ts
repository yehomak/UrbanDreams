import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const isCI = process.env.DEV === 'true';
const isLocalHttpsAvailable =
  existsSync('tma.internal.pem') && existsSync('tma.internal-key.pem');

const httpsConfig = !isCI && isLocalHttpsAvailable
  ? {
      cert: readFileSync(resolve('tma.internal.pem')),
      key: readFileSync(resolve('tma.internal-key.pem')),
    }
  : undefined;

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    basicSsl(),
    // Allows using React dev server along with building a React application with Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    nodePolyfills({
      include: ['buffer'], // Only polyfill Buffer
      globals: {
        Buffer: true,
      }
    }),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Creates a custom SSL certificate valid for the local machine.
    // Using this plugin requires admin rights on the first dev-mode launch.
    // https://www.npmjs.com/package/vite-plugin-mkcert
    process.env.HTTPS && mkcert(),
  ],
  build: {
    target: 'esnext',
  },
  publicDir: './public',
  server: {
    host: 'tma.internal',
    https: httpsConfig,
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  },
});

