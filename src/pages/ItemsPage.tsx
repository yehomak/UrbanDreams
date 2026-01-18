// src/pages/AllNftsPage/AllNftsPage.tsx
import { useEffect, useState } from 'react';
import { UrbanLayout } from '@/components/UrbanLayout';
import { RunningRabbitLoading } from '@/components/RunningRabbitLoading';
import { useNftsData } from '@/hooks/useNftsData';
import { GetGemsButton } from '@/components/GetGemsButton';
import { ExpandableMenu } from '@/components/ExpandableMenu';
import { generateMapsUrls } from '@/components/GoogleMapsButton';
import { COLLECTION } from '@/constants/collection';
import "/src/css/leafletmap.css";
import { useViewportUnits } from '@/hooks/useViewportUnits';


type NftAttribute = {
  trait_type: string;
  value: string | number | boolean;
};

type NftMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number | boolean;
  }>;
};

export type NftItem = {
  index: number;
  blockchainHash: string;
  ipfsHash: string;
  metadata: NftMetadata;
  imageUrl: string;
};

export function ItemsPage() {
  useViewportUnits();
  const { nfts, isLoading } = useNftsData();
  const [selected, setSelected] = useState<NftItem | null>(null);

  const closeModal = () => setSelected(null);

  // Close on ESC
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const handleCardClick = (nft: NftItem) => {
    setSelected(nft);
  };

  return (
    <UrbanLayout allowScroll={true}>
      <div
        style={{
          height: '100svh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          background:
            'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            margin: '7rem auto 1.5rem',
            padding: '0 0.75rem 1.5rem',
          }}
        >
          {isLoading && (
            <div
              style={{
                paddingTop: '2.5rem',
                paddingBottom: '1rem',
              }}
            >
              <RunningRabbitLoading />
            </div>
          )}

          {!isLoading && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.9rem',
              }}
            >
              {nfts.map((nft) => (
                <button
                  key={nft.index}
                  type="button"
                  onClick={() => handleCardClick(nft as NftItem)}
                  style={{
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '133%', // ~3:4 for 3023x4032
                      overflow: 'hidden',
                      background: '#10141f',
                    }}
                  >
                    <img
                      src={nft.imageUrl}
                      alt={nft.title || ''}
                      loading="lazy"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'translateZ(0)',
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shared Modal (same style as map modal) */}
      {selected && (
        <div className="ll-modal-backdrop" onClick={closeModal}>
          <div
            className="ll-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="ll-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="ll-modal-scroll">
              {/* image */}
              <div className="ll-modal-img-host">
                <img
                  className="ll-modal-image is-open"
                  src={selected.imageUrl}
                  alt={selected.metadata.name || 'Urban Dream'}
                />
              </div>

              <div className="ll-modal-reveal open">
                <h3 className="ll-modal-title">
                  {selected.metadata.name || `Urban Dream #${selected.index}`}
                </h3>
                {selected.metadata?.attributes?.length ? (
                <div className="attr-table">
                  {selected.metadata.attributes
                    .filter((a) => a?.trait_type && a?.value !== undefined && a?.value !== null)
                    .slice(0, 6)
                    .map((attr, i) => (
                      <div className="attr-cell" key={`${attr.trait_type}-${i}`}>
                        <div className="attr-key">{attr.trait_type}</div>
                        <div className="attr-val">{String(attr.value)}</div>
                      </div>
                    ))}
                </div>
              ) : null}

                {selected.metadata.description && (
                  <p className="ll-modal-desc">{selected.metadata.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </UrbanLayout>
  );
}
