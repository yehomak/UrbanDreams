// src/pages/IndexPage/IndexPage.tsx
import { useState } from 'react';
import { RunningRabbitLoading } from '@/components/RunningRabbitLoading';
import { LeafletMap } from '@/components/LeafletMap';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { TonConnectButton, useTonWallet, useTonConnectUI, WalletInfo } from '@tonconnect/ui-react';
import { openLink } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';
import '/src/css/Header.css';
import '/src/css/index.css';


export function IndexPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {isLoading && <RunningRabbitLoading />}
      {/* Sidebar Menu */}
      <div style={{
        position: 'fixed',
        top: '9%',
        left: isMenuOpen ? 0 : '-85%',
        width: '85%',
        height: '100vh',
        backgroundColor: '#17212b',
        transition: 'left 0.8s ease',
        zIndex: 1000,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        
        <div style={{
    padding: '1rem',
    marginBottom: '1rem',
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
          fontFamily: 'monospace',
          color: '#a1a1a1'
        }}>
          {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
        </div>
        <button
          onClick={() => tonConnectUi.disconnect()}
          style={{
            background: 'transparent',
            color: '#ff4d4f',
            border: '1px solid #ff4d4f',
            padding: '0.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Disconnect
        </button>
      </div>
    ) : (
      <button 
        onClick={() => tonConnectUi.openModal()}
        style={{
          width: '100%',
          background: 'transparent',
          color: '#d8d8d8',
          border: 'none',
          padding: '0.75rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1.2rem'
        }}
      >
        Connect wallet
      </button>
    )}
  </div>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <button 
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '1.2rem',
                backgroundColor: 'transparent',
                color: '#d8d8d8',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #232e3c'
              }}
              onClick={() => alert('Profile clicked')}
            >
              Profile
            </button>
          </li>
        </ul>
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
          paddingBottom: '0.8rem',
          borderBottom: '0.1rem solid #232e3c',
          position: 'fixed', /* Keeps header locked */
          top: 0,
          width: '100%',
          height: '9%',
          zIndex: 1001
        }}
      >
        <div className="header-content">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d8d8d8',
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
        transition: 'margin-left 0.8s ease',
        height: 'calc(100vh - 60px)', /* Subtract header height */
        overflow: 'auto'
      }}>
        <LeafletMap 
          center={[52.226424, 20.998807]}
          zoom={15}
          markers={markers}
        />
      </div>
    </div>
  );
}