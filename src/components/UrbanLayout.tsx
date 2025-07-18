// src/components/UrbanLayout.tsx
import { useState, useRef, useEffect } from 'react';
import { TonConnectButton, useTonWallet, useTonConnectUI, WalletInfo } from '@tonconnect/ui-react';
import { Link } from 'react-router-dom';
import '/src/css/Header.css';
import '/src/css/index.css';

interface MenuItem {
  label: string;
  path: string;
  icon?: string;
}

export function UrbanLayout({ children, title = 'Urban Dreams', allowScroll=false }: { children: React.ReactNode; title?: string;  allowScroll?: boolean; }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [allowScroll]);
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  const menuItems: MenuItem[] = [
    { label: 'Map', path: '/', icon: '🗺️' },
    { label: 'Project Flow', path: '/roadmap', icon: '🛣️' },
    //{ label: 'Profile', path: '/profile', icon: '👤' }
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Side Menu */}
      <div style={{
        position: 'fixed',
        top: '11%',
        left: isMenuOpen ? 0 : '-85%',
        width: '85%',
        height: '100vh',
        backgroundColor: '#17212b',
        transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        {/* Wallet Section */}
        <div style={{
          padding: '0.5rem',
          borderBottom: '1px solid #232e3c'
        }}>
          {wallet ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: '#f5f5f5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img 
                  src={(wallet as WalletInfo).imageUrl} 
                  alt={(wallet as WalletInfo).name}
                  width={24}
                  height={24}
                  style={{ borderRadius: '4px' }}
                />
                <span>{(wallet as WalletInfo).name}</span>
              </div>
              <div style={{ 
                fontSize: '0.8rem',
                wordBreak: 'break-all',
                color: '#a1a1a1'
              }}>
                {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
              </div>
              <button
                onClick={() => {
                  tonConnectUi.disconnect();
                  closeMenu();
                }}
                style={{
                  background: 'transparent',
                  color: '#ff4d4f',
                  border: '1px solid #ff4d4f',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  width: '100%'
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                tonConnectUi.openModal();
                closeMenu();
              }}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#d8d8d8',
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Connect Wallet <span style={{ fontSize: '1.2rem', marginLeft: '1rem' }}>👛</span>
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    color: '#d8d8d8',
                    textDecoration: 'none',
                    borderBottom: '1px solid #232e3c',
                    fontSize: '1.2rem'
                  }}
                  onClick={closeMenu}
                >
                  {item.label}
                  <span style={{ fontSize: '1.2rem', marginLeft: '1rem' }}>{item.icon}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            backdropFilter: 'blur(2px)'
          }}
          onClick={closeMenu}
        />
      )}

      {/* Header */}
      <header
        style={{
          backgroundColor: '#17212b',
          color: '#f5f5f5',
          padding: '0.8rem 0',
          borderBottom: '1px solid #232e3c',
          position: 'fixed',
          top: 0,
          width: '100%',
          height: '8%',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#d8d8d8',
            fontSize: '1.8rem',
            cursor: 'pointer',
            width: '3rem', // Fixed width
            minWidth: '3rem', // Ensure width doesn't shrink
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '0.4rem'
          }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
        
        <h1
          id='title'
          style={{
            marginLeft: '1rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {title}
        </h1>
    </header>

      {/* Main Content */}
      <main style={{
        height: '100%',
        transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        marginLeft: isMenuOpen ? '80%' : '0',
        overflow: allowScroll ? 'auto' : 'hidden',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: allowScroll ? 'touch' : 'auto'
      }}>
        {children}
      </main>
    </div>
  );
}