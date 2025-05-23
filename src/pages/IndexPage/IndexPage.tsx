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
import { fetchIPFSData } from '@/utils/ipfs';

interface Marker {
  position: [number, number];
  title: string;
  description: string;
  type: string;
  img_src: string;
  nftMetadata?: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | boolean | number;
    }>;
  };
}


export function IndexPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const start_pos = [52.226424, 20.998807]
  
  // const markers = [
  //   {
  //     position: [52.223219, 21.014660],
  //     title: "Bodya Balcony View",
  //     description: "What a good time...",
  //     type: "balcony",
  //     img_src: "../../../assets/bohdan_balkony.png"
  //   },
  //   {
  //     position: [52.229612, 20.957859],
  //     title: "Wola station",
  //     description: "Like this place.",
  //     type: "station",
  //     img_src: "../../../assets/wola_station.png"
  //   }
  // ];

  useEffect(() => {
    const loadMarkers = async () => {
      try {
        // Initial static markers
        const initialMarkers: Marker[] = [
        ];

        // Example: Load NFT data for markers
        // You would replace these with actual IPFS URIs from your NFTs
        const nftUris = [
          'bafybeicoko77fbnn5s5ooeuetpono3slwwvqin2arl6gawbhtkiezoys5q/nfts/0/meta.json', // Replace with actual IPFS URIs
          'bafybeicoko77fbnn5s5ooeuetpono3slwwvqin2arl6gawbhtkiezoys5q/nfts/1/meta.json'
        ];

        const nftMetadataList = await Promise.all(
          nftUris.map(uri => 
            fetchIPFSData(uri).catch(error => {
              console.error(`Error loading NFT ${uri}:`, error);
              return null;
            })
          )
        );

        const loadedMarkers = nftMetadataList
          .filter(metadata => metadata !== null)
          .map(metadata => {
            // Extract location from attributes
            console.log(metadata);
            const locationAttr = metadata?.attributes.find(attr => attr.trait_type === 'Location');
            const [lat, lng] = locationAttr?.value 
              ? (locationAttr.value as string).split(',').map(Number) 
              : start_pos; // Default position if not found

            return {
              position: [lat, lng] as [number, number],
              title: metadata?.name || 'Untitled NFT',
              description: metadata?.description || 'No description',
              type: 'nft',
              img_src: metadata?.image 
                ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
                : 'https://i1.sndcdn.com/artworks-PC0vxgr8ydeSsQPa-UeUfQg-t500x500.jpg',
              nftMetadata: metadata
            };
          });

        setMarkers([...loadedMarkers]);
      } catch (error) {
        console.error('Error loading markers:', error);
        // Fallback to static markers if NFT loading fails
        setMarkers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {isLoading && <RunningRabbitLoading />}
      {/* Sidebar Menu */}
      <div style={{
        position: 'fixed',
        top: '8%',
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
    marginBottom: '1rem',
    marginTop: '1rem',
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
          padding: '1.5rem',
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
          <li >
            <button 
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '1.2rem',
                backgroundColor: 'transparent',
                color: '#d8d8d8',
                border: 'none',
                cursor: 'pointer',
                padding: '1.5rem',
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
          height: '8%',
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
              left: '0.8rem',
              top: '0.9rem'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          <h1 style={{ marginLeft: '2rem' }}>Urban Dreams</h1>
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
          center={start_pos}
          zoom={15}
          markers={markers}
        />
      </div>
    </div>
  );
}