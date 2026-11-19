import { NavLink, Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { Monogram } from './Monogram.tsx';
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

  return (
    <>
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
            <Monogram />
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
      <ScrollRestoration />
    </>
  );
}
