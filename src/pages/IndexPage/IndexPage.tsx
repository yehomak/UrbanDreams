// src/pages/IndexPage/IndexPage.tsx
import { useState, useEffect } from 'react';
import { LeafletMap } from '@/components/LeafletMap';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { openLink } from '@telegram-apps/sdk-react';
import { RunningRabbitLoading } from '@/components/RunningRabbitLoading';
import '/src/css/Header.css';
import '/src/css/index.css';

export function IndexPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wallet = useTonWallet();
  const launchParams = retrieveLaunchParams();
  
  const markers = [
    {
      position: [52.223219, 21.014660],
      title: "Bodya Balcony View",
      description: "What a good time...",
      type: "balcony",
      img_src: "../../../assets/bohdan_balkony.png"
    },
    {
      position: [52.229612, 20.957859],
      title: "Wola station",
      description: "Like this place.",
      type: "station",
      img_src: "../../../assets/wola_station.png"
    }
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Loading Overlay */}
      {isLoading && <RunningRabbitLoading />}

      {/* Rest of your existing code... */}
      {/* Sidebar Menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isMenuOpen ? 0 : '-80%',
        width: '80%',
        height: '100vh',
        backgroundColor: '#17212b',
        borderRight: '2px solid #232e3c',
        transition: 'left 0.8s ease',
        zIndex: 1000,
        padding: '0.5rem',
        boxSizing: 'border-box'
      }}>
        {/* ... existing menu content ... */}
      </div>

      {/* Overlay when menu is open */}
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
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Header with Menu Toggle */}
      <header 
        className="urban-dreams-header"
        style={{
          backgroundColor: '#17212b',
          color: '#f5f5f5',
          borderBottom: '1px solid #232e3c',
          position: 'relative',
          zIndex: 1001
        }}
      >
        <div className="header-content">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f5f5f5',
              fontSize: '35px',
              cursor: 'pointer',
              position: 'absolute',
              left: '15px',
              top: '15px'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          <h1 style={{ marginLeft: '40px' }}>Urban Dreams</h1>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        marginLeft: isMenuOpen ? '80%' : '0',
        transition: 'margin-left 0.8s ease'
      }}>
        {!isLoading && (
          <LeafletMap 
            center={[52.226424, 20.998807]}
            zoom={15}
            markers={markers}
          />
        )}
      </div>
    </div>
  );
}