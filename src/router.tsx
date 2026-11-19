import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { RouteError } from './pages/RouteError.tsx';

/** Each page is its own chunk; the map (Leaflet) only loads when you open it. */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: () => import('./pages/MapPage.tsx').then((m) => ({ Component: m.MapPage })) },
      { path: 'works', lazy: () => import('./pages/WorksPage.tsx').then((m) => ({ Component: m.WorksPage })) },
      { path: 'works/:slug', lazy: () => import('./pages/WorkPage.tsx').then((m) => ({ Component: m.WorkPage })) },
      { path: 'about', lazy: () => import('./pages/AboutPage.tsx').then((m) => ({ Component: m.AboutPage })) },
      { path: '*', lazy: () => import('./pages/NotFoundPage.tsx').then((m) => ({ Component: m.NotFoundPage })) },
    ],
  },
]);
