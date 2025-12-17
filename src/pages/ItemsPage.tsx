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
  attributes?: NftAttribute[];
};

type NftItem = {
  index: number;
  title?: string;
  description?: string;
  imageUrl: string;
  blockchainHash: string;
  position?: [number, number]; // optional coords for maps
  nftMetadata?: NftMetadata;   
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
                  alt={selected.title || 'Urban Dream'}
                />
              </div>

              <div className="ll-modal-reveal open">
                <h3 className="ll-modal-title">
                  {selected.title || `Urban Dream #${selected.index}`}
                </h3>
                {selected.nftMetadata?.attributes?.length ? (
                <div className="attr-table">
                  {selected.nftMetadata.attributes
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

                {/* Action buttons */}
                <div className="action-buttons-section">
                  <div className="primary-button-container">
                    <GetGemsButton
                      blockchainHash={selected.blockchainHash}
                      nftName={selected.title}
                      variant="primary"
                      onSuccess={(url) =>
                        console.log('GetGems opened:', url)
                      }
                      onError={(error) =>
                        console.error('GetGems error:', error)
                      }
                    />
                  </div>

                  <ExpandableMenu
                    items={[
                      {
                        label: 'View on Map',
                        icon: '📍',
                        onClick: () => {
                          if (!selected.position) return;
                          const urls = generateMapsUrls(
                            selected.position[0],
                            selected.position[1],
                          );
                          window.open(
                            urls.search,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        },
                      },
                      {
                        label: 'Get Directions',
                        icon: '🧭',
                        onClick: () => {
                          if (!selected.position) return;
                          const urls = generateMapsUrls(
                            selected.position[0],
                            selected.position[1],
                          );
                          window.open(
                            urls.directions,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        },
                      },
                      {
                        label: 'Share',
                        icon: '📤',
                        onClick: () => {
                          const shareData = {
                            title:
                              selected.title ||
                              `Urban Dream #${selected.index}`,
                            text: selected.description || '',
                            url: 'https://t.me/UrbanDreamsBot/Explorer',
                          };

                          if (navigator.share) {
                            navigator.share(shareData);
                          } else {
                            navigator.clipboard.writeText(
                              window.location.href,
                            );
                            if (window.Telegram?.WebApp) {
                              window.Telegram.WebApp.showAlert(
                                'Link copied to clipboard!',
                              );
                            }
                          }
                        },
                      },
                      {
                        label: 'View On Chain',
                        icon: '🔗',
                        onClick: () => {
                          const itemUrl = `https://tonscan.org/nft/${selected.blockchainHash}`;
                          window.open(
                            itemUrl,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        },
                      },
                    ]}
                  />
                </div>

                {selected.description && (
                  <p className="ll-modal-desc">{selected.description}</p>
                )}

                {/* Minimalistic 2×3 attributes table */}
                {selected.nftMetadata?.attributes &&
                  selected.nftMetadata.attributes.length > 0 && (
                    <div
                      style={{
                        margin: '0.5rem auto 1.8rem',
                        maxWidth: '420px',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(2, minmax(0, 1fr))',
                          gap: '0.55rem 0.95rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        {selected.nftMetadata.attributes
                          .slice(0, 6) // 2×3 grid = 6 cells max
                          .map((attr, i) => (
                            <div key={i}>
                              <div
                                style={{
                                  textTransform: 'uppercase',
                                  opacity: 0.6,
                                  letterSpacing: '0.06em',
                                  fontSize: '0.7rem',
                                  marginBottom: '0.15rem',
                                }}
                              >
                                {attr.trait_type}
                              </div>
                              <div
                                style={{
                                  color: '#e5e7eb',
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {String(attr.value)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </UrbanLayout>
  );
}
