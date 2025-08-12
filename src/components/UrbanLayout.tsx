import { useState, useRef, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonWallet, useTonConnectUI, WalletInfo } from '@tonconnect/ui-react';
import { Link } from 'react-router-dom';
import '/src/css/Header.css';
import '/src/css/index.css';

interface MenuItem {
  label: string;
  path: string;
  icon?: string;
}

const colors = {
  accentText: "#6ab2f2",
  bg: "#17212b",
  button: "#5288c1",
  buttonText: "#ffffff",
  destructive: "#ec3942",
  headerBg: "#17212b",
  hint: "#708499",
  link: "#6ab3f3",
  secondaryBg: "#232e3c",
  sectionHeaderText: "#6ab3f3",
  subtitle: "#708499",
  text: "#f5f5f5",
  light_white: "#f5f5f5",
};

// Pre-calculated animation steps (60 frames for 1 second of animation)
const ANIMATION_STEPS = 60;
const ANIMATION_DURATION = 9000; // ms
const animationFrames = Array(ANIMATION_STEPS).fill(0).map((_, i) => {
  const progress = i / ANIMATION_STEPS;
  return Math.sin(progress * Math.PI * 2) * 3; // 3px max movement
});

export function UrbanLayout({ children, title = 'Urban Dreams', allowScroll = false }: { children: React.ReactNode; title?: string; allowScroll?: boolean; }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const animationFrameRef = useRef<number>();
  const animationStartRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [allowScroll]);

  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  const animate = useCallback((timestamp: number) => {
    if (!animationStartRef.current) {
      animationStartRef.current = timestamp;
    }
    
    const elapsed = timestamp - animationStartRef.current;
    currentStepRef.current = Math.floor((elapsed % ANIMATION_DURATION) / ANIMATION_DURATION * ANIMATION_STEPS);
    
    if (titleRef.current) {
      const letters = Array.from(titleRef.current.children) as HTMLElement[];
      const offset = animationFrames[currentStepRef.current];
      
      letters.forEach((letter, i) => {
        // Stagger the animation for each letter
        const letterOffset = (i % 3) * (ANIMATION_STEPS / 3);
        const step = (currentStepRef.current + letterOffset) % ANIMATION_STEPS;
        letter.style.transform = `translateY(${animationFrames[step]}px)`;
      });
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const renderTitle = useCallback((text: string) => {
    return text.split('').map((char, i) => (
      <span 
        key={i}
        style={{
          transition: 'transform 0.15s ease-out',
          display: 'inline-block',
          willChange: 'transform'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, []);

  const menuItems: MenuItem[] = [
    { label: 'Map', path: '/', icon: '🗺️' },
    { label: 'Project Flow', path: '/roadmap', icon: '🛣️' },
  ];

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Side Menu */}
      <div style={{
        position: 'fixed',
        top: '11%',
        left: isMenuOpen ? 0 : '-85%',
        width: '85%',
        height: '100vh',
        backgroundColor: colors.headerBg,
        transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        {/* Wallet Section */}
        <div style={{
          padding: '0.5rem',
          borderBottom: `1px solid ${colors.secondaryBg}`
        }}>
          {wallet ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: colors.text
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
                color: colors.hint
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
                  color: colors.destructive,
                  border: `1px solid ${colors.destructive}`,
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
                color: colors.text,
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Connect Wallet <span style={{ fontSize: '1.3rem', marginLeft: '1rem' }}>👛</span>
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
                    padding: '2rem',
                    color: colors.text,
                    textDecoration: 'none',
                    borderBottom: `1px solid ${colors.secondaryBg}`,
                    fontSize: '1.4rem'
                  }}
                  onClick={closeMenu}
                >
                  {item.label}
                  <span style={{ fontSize: '1.3rem', marginLeft: '1rem' }}>{item.icon}</span>
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
          backgroundColor: colors.headerBg,
          color: colors.text,
          padding: '0.8rem 0',
          borderBottom: '1px solid #232e3c',
          position: 'fixed',
          top: 0,
          width: '100%',
          height: '9%',
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
            fontSize: '2.3rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '0.5rem',
            marginTop: 0,
            paddingTop: 0,
          }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
        
        <h1 
          id='title'
          ref={titleRef}
        >
          {renderTitle(title)}
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