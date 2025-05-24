// src/components/LeafletMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-pulse-icon';
//import { fetchNFTMetadata } from '@/utls/ton-nft';

const colors = {
  accentText: '#6ab2f2',
  bg: '#17212b',
  button: '#5288c1',
  buttonText: '#ffffff',
  destructive: '#ec3942',
  headerBg: '#17212b',
  hint: '#708499',
  link: '#6ab3f3',
  secondaryBg: '#232e3c',
  sectionHeaderText: '#6ab3f3',
  subtitle: '#708499',
  text: '#f5f5f5',
  light_white: '#f5f5f5'
};

interface Marker {
  position: [number, number];
  title: string;
  description?: string;
  img_src?: string;
  type?: string;
}


// interface LeafletMapProps {
//   center?: [number, number];
//   zoom?: number;
//   className?: string;
//   markers?: Array<{
//     position: [number, number];
//     title: string;
//     description?: string;
//     img_src?: string;
//     type?: 'office' | 'park' | 'landmark' | 'balcony'|'station';
//   }>;
// }


export const LeafletMap: React.FC<{
  center: [number, number];
  zoom?: number;
  markers?: Marker[];
}> = ({ center, zoom = 13, markers = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);


  const createMarkerIcon = (type: string = 'default') => {
    const typeStyles = {
      office: {
        color: colors.button,
        shape: 'circle',
        symbol: '🏢'
      },
      park: {
        color: colors.accentText,
        shape: 'square',
        symbol: '🌳'
      },
      landmark: {
        color: colors.sectionHeaderText,
        shape: 'star',
        symbol: '⭐'
      },
      balcony: {
        color: colors.sectionHeaderText,
        shape: 'square',
        symbol: '🌇'
      },
      station: {
        color: colors.sectionHeaderText,
        shape: 'square',
        symbol: '🚉'
      },
      default: {
        color: colors.destructive,
        shape: 'circle',
        symbol: '📍'
      }
    };

    const style = typeStyles[type as keyof typeof typeStyles] || typeStyles.default;

    return L.divIcon({
      className: `urban-marker ${type}`,
      html: `
        <div style="
          background: ${style.color};
          color: ${colors.text};
          width: 32px;
          height: 32px;
          border-radius: ${style.shape === 'circle' ? '50%' : '4px'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid ${colors.text};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transform: ${type === 'park' ? 'rotate(45deg)' : 'none'};
        ">
          ${style.symbol}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  };

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    try {
      mapInstance.current = L.map(mapContainer.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
        touchZoom: true,
        bounceAtZoomLimits: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        detectRetina: true,
        maxZoom: 19,
        minZoom: 5
      }).addTo(mapInstance.current);

      return () => {
        mapInstance.current?.remove();
        mapInstance.current = null;
      };
    } catch (err) {
      setError('Failed to initialize map');
      console.error(err);
    }
  }, []);


  useEffect(() => {
    if (!mapInstance.current) return;


    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

      markers.forEach(marker => {
        const customIcon = createMarkerIcon(marker.type);

        
        L.marker(marker.position, { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div class="col_popup", style="
              background: ${colors.secondaryBg};
              color: ${colors.text};
              padding: 12px;
              border-radius: 16px;
            ">
              ${marker.img_src ? `
                <img 
                  src="${marker.img_src}" 
                  style="
                    margin-top: 5%;
                    width: 100%;
                    border-radius: 4px;
                    margin-bottom: 8px;
                    max-height: 200px;
                    object-fit: cover;
                  "
                  alt="${marker.title}"
                >
              ` : ''}
              <h3 class="col_title">${marker.title}</h3>
            </div>
          `, {
            className: 'urban-popup',
            maxWidth: 300
          });
      });

    }, [markers]);

  if (error) return <div className="map-error">{error}</div>;

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '150vh',
      minHeight: '300px',
      maxHeight: '800px',
    }}>
      <div
        ref={mapContainer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
    </div>
  );
};