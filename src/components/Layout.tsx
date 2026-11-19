import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router';
import { CloudCurtain } from './curtain/CloudCurtain.tsx';
import { CurtainContext, useDelayedFlag, type CurtainApi } from './curtain/curtain.ts';
import { Sky } from './Sky.tsx';
import { Wordmark } from './Wordmark.tsx';
import { Grain } from './Grain.tsx';
import './Layout.css';

function NavItem({ to, label, end = false }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className="nav-link" viewTransition>
      {label}
    </NavLink>
  );
}

export function Layout() {
  const navigation = useNavigation();
  const pending = navigation.state !== 'idle';

  // The curtain starts closed ("boot") and opens once fonts are in and the first page has painted.
  const [holds, setHolds] = useState<ReadonlySet<string>>(() => new Set(['boot']));
  const curtain = useMemo<CurtainApi>(
    () => ({
      hold: (id) => setHolds((s) => (s.has(id) ? s : new Set(s).add(id))),
      release: (id) =>
        setHolds((s) => {
          if (!s.has(id)) return s;
          const next = new Set(s);
          next.delete(id);
          return next;
        }),
    }),
    [],
  );

  const loading = useDelayedFlag(holds.size > 0 || pending);
  const onMap = useLocation().pathname === '/';

  useEffect(() => {
    let alive = true;
    const minimum = new Promise((resolve) => setTimeout(resolve, 700));
    Promise.all([document.fonts.ready, minimum]).then(() => alive && curtain.release('boot'));
    return () => {
      alive = false;
    };
  }, [curtain]);

  return (
    <CurtainContext value={curtain}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="route-progress" data-active={pending} aria-hidden="true" />

      <header className="site-header">
        <span className="site-header__cloud" aria-hidden="true" />
        <nav className="site-header__nav" aria-label="Primary">
          <div className="site-header__side site-header__side--start">
            <NavItem to="/" label="Map" end />
            <NavItem to="/works" label="Works" />
          </div>

          <NavLink to="/" className="site-header__brand" aria-label="Urban Dreams, home" viewTransition>
            <Wordmark />
          </NavLink>

          <div className="site-header__side site-header__side--end">
            <NavItem to="/about" label="About" />
          </div>
        </nav>
      </header>

      <main id="main" className="site-main">
        <Outlet />
      </main>
      <Grain />
      <CloudCurtain shown={loading} />
      <Sky mode={loading ? 'dense' : onMap ? 'ambient' : 'off'} />
      <ScrollRestoration />
    </CurtainContext>
  );
}
