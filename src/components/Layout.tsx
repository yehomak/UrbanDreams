import { NavLink, Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { Wordmark } from './Wordmark.tsx';
import { Grain } from './Grain.tsx';
import './Layout.css';

const NAV = [
  { to: '/', label: 'Map', end: true },
  { to: '/works', label: 'Works', end: false },
  { to: '/about', label: 'About', end: false },
] as const;

function Nav({ className }: { className: string }) {
  return (
    <nav className={className} aria-label="Primary">
      {NAV.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className="nav-link" viewTransition>
          {item.label}
        </NavLink>
      ))}
    </nav>
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
        <NavLink to="/" className="site-header__brand" aria-label="Urban Dreams — map" viewTransition>
          <Wordmark text="Urban Dreams" />
        </NavLink>
        <Nav className="site-nav site-nav--top" />
      </header>
      <main id="main" className="site-main">
        <Outlet />
      </main>
      <Nav className="site-nav site-nav--dock" />
      <Grain />
      <ScrollRestoration />
    </>
  );
}
