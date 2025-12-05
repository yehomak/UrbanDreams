// src/pages/VisionPage/VisionPage.tsx
import { useEffect, useRef, useState } from 'react';
import { UrbanLayout } from '@/components/UrbanLayout';

const colors = {
  bg: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
  card: 'rgba(255,255,255,0.05)',
  cardSoft: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#f5f5f5',
  hint: '#9aa7bd',
  accent: '#6ab3f3',
  accentSoft: '#B069DB',
  positive: '#4CAF50',
};

type SectionProps = {
  children: React.ReactNode;
  index: number;
};

function SnapSection({ children, index }: SectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(index === 0); // first visible by default

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // when section is at least ~40% in view – mark visible
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            setVisible(true);
          }
        });
      },
      {
        threshold: [0.2, 0.4, 0.6],
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        scrollSnapAlign: 'start',
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 1rem',
        boxSizing: 'border-box',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(40px)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function VisionPage() {
  return (
    <UrbanLayout allowScroll={true}>
      {/* Outer full-page scroll container with snap */}
      <div
        style={{
          height: '100vh',
          width: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          background: colors.bg,
          color: colors.text,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* 1 · Hero / Intro */}
        <SnapSection index={0}>
          <div
            style={{
              padding: '2rem 1.6rem',
              borderRadius: '20px',
              background: colors.card,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '0.8rem',
                fontSize: '0.75rem',
              }}
            >
              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                Warsaw Edition · TON
              </span>
              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                Map-native NFT collection
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '2.1rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              Urban Dreams: vision
            </h2>

            <p
              style={{
                marginTop: '0.9rem',
                marginBottom: '1.2rem',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              Urban Dreams is a map-native NFT project on TON that fuses real
              Warsaw locations with public-domain art through style transfer.
              Each NFT is a geo-tagged memory fragment — and the collection’s
              economy shares royalties with the people who hold those fragments.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.75rem',
                marginTop: '0.75rem',
                fontSize: '0.8rem',
              }}
            >
              <div
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '12px',
                  background: colors.cardSoft,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ color: colors.hint, marginBottom: '0.25rem' }}>
                  Phase
                </div>
                <div>Q1 2025 · MVP in progress</div>
                <div style={{ fontSize: '0.75rem', color: colors.hint }}>
                  12/100 NFTs live • treasury on testnet
                </div>
              </div>
              <div
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '12px',
                  background: colors.cardSoft,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ color: colors.hint, marginBottom: '0.25rem' }}>
                  Core loop
                </div>
                <div>Mint · Collect · Walk · Share · Earn</div>
                <div style={{ fontSize: '0.75rem', color: colors.hint }}>
                  Holders share secondary sale royalties
                </div>
              </div>
            </div>
          </div>
        </SnapSection>

        {/* 2 · What is Urban Dreams */}
        <SnapSection index={1}>
          <div
            style={{
              padding: '1.8rem 1.6rem',
              borderRadius: '18px',
              background: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '0.8rem',
                fontSize: '1.3rem',
                color: colors.accent,
                fontWeight: 500,
              }}
            >
              What is Urban Dreams?
            </h3>
            <p
              style={{
                margin: '0 0 0.8rem 0',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              At its core, Urban Dreams is:
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>
                • A <strong>geo-anchored NFT collection</strong> — each piece
                is tied to real Warsaw coordinates.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                • An <strong>art pipeline</strong> that blends urban photos
                with public-domain art via ML style transfer.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                • A <strong>TON-native economy</strong> that shares secondary
                sale royalties between holders and the project treasury.
              </li>
              <li>
                • A <strong>Telegram-first experience</strong> — map, treasury
                stats, and holder tools live inside a Mini App and bot.
              </li>
            </ul>
          </div>
        </SnapSection>

        {/* 3 · System architecture */}
        <SnapSection index={2}>
          <div>
            <h3
              style={{
                margin: '0 0 0.9rem 0',
                fontSize: '1.2rem',
                color: colors.accent,
                fontWeight: 500,
              }}
            >
              How the system is built
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '0.9rem',
              }}
            >
              <div
                style={{
                  padding: '1.1rem 1.2rem',
                  borderRadius: '16px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: colors.hint,
                    marginBottom: '0.3rem',
                  }}
                >
                  1 · On-chain layer
                </div>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: '0.4rem',
                    fontSize: '1rem',
                  }}
                >
                  NFT Collection + Royalty Splitter
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    color: colors.hint,
                  }}
                >
                  <li style={{ marginBottom: '0.35rem' }}>
                    • Standard TON NFT collection contract for{' '}
                    <strong>Urban Dreams: Warsaw Edition</strong>.
                  </li>
                  <li style={{ marginBottom: '0.35rem' }}>
                    • Custom{' '}
                    <strong>
                      <code>ton-royalty-splitter</code>
                    </strong>{' '}
                    contract:
                    <br />
                    &nbsp;&nbsp;– 50% of secondary sale royalties → NFT holders
                    <br />
                    &nbsp;&nbsp;– 50% → project &amp; creator treasury
                  </li>
                  <li>
                    • Payouts organised into <strong>epochs</strong> using a
                    Merkle tree snapshot of holders.
                  </li>
                </ul>
              </div>

              <div
                style={{
                  padding: '1.1rem 1.2rem',
                  borderRadius: '16px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: colors.hint,
                    marginBottom: '0.3rem',
                  }}
                >
                  2 · Experience layer
                </div>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: '0.4rem',
                    fontSize: '1rem',
                  }}
                >
                  Telegram Mini App + Bot
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    color: colors.hint,
                  }}
                >
                  <li style={{ marginBottom: '0.35rem' }}>
                    • <strong>City Map</strong> of NFTs – browse items on the
                    map, open details, follow links to marketplace.
                  </li>
                  <li style={{ marginBottom: '0.35rem' }}>
                    • <strong>Roadmap & Treasury</strong> tabs – transparent
                    view into project progress and on-chain treasury state.
                  </li>
                  <li>
                    • <strong>@UrbanDreamsBot</strong> with <code>/verify</code>{' '}
                    for holder verification and future voting features.
                  </li>
                </ul>
              </div>

              <div
                style={{
                  padding: '1.1rem 1.2rem',
                  borderRadius: '16px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: colors.hint,
                    marginBottom: '0.3rem',
                  }}
                >
                  3 · Content & community
                </div>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: '0.4rem',
                    fontSize: '1rem',
                  }}
                >
                  Channel, drops & votes
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    color: colors.hint,
                  }}
                >
                  <li style={{ marginBottom: '0.35rem' }}>
                    • Telegram channel with <strong>Art Insights</strong> and
                    project updates.
                  </li>
                  <li style={{ marginBottom: '0.35rem' }}>
                    • Voting for holders: next styles, locations, features.
                  </li>
                  <li>
                    • Long-term: holder-driven governance of treasury and
                    collection evolution.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </SnapSection>

        {/* 4 · Treasury & epochs */}
        <SnapSection index={3}>
          <div
            style={{
              padding: '1.6rem 1.6rem',
              borderRadius: '18px',
              background: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '0.9rem',
                fontSize: '1.2rem',
                color: colors.accentSoft,
                fontWeight: 500,
              }}
            >
              Treasury & royalty mechanics
            </h3>

            <p
              style={{
                margin: '0 0 0.7rem 0',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              Every secondary sale sends royalties into the{' '}
              <strong>Royalty Splitter</strong>. Funds are then periodically
              distributed to holders through epochs:
            </p>

            <ol
              style={{
                margin: '0 0 0.8rem 1.1rem',
                padding: 0,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              <li style={{ marginBottom: '0.4rem' }}>
                A snapshot of all NFT holders is taken via TonAPI and stored
                off-chain.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                A <strong>Merkle tree</strong> is built from the snapshot; the
                root is set on-chain with <code>set_epoch</code>.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                The snapshot + proofs are published to IPFS and used inside the
                Mini App.
              </li>
              <li>
                Holders claim their share by signing a{' '}
                <strong>Merkle proof</strong> via TonConnect — the splitter
                verifies and pays out.
              </li>
            </ol>

            <div
              style={{
                marginTop: '0.9rem',
                padding: '0.8rem 0.9rem',
                borderRadius: '12px',
                background: colors.cardSoft,
                border: `1px dashed ${colors.border}`,
                fontSize: '0.85rem',
                color: colors.hint,
              }}
            >
              <div style={{ marginBottom: '0.2rem', color: colors.text }}>
                MVP treasury goals
              </div>
              <div>• First payout once treasury ≥ 0.5 TON.</div>
              <div>• Target: 20+ verified holders for early epochs.</div>
            </div>
          </div>
        </SnapSection>

        {/* 5 · Phases & KPIs */}
        <SnapSection index={4}>
          <div>
            <h3
              style={{
                margin: '0 0 0.9rem 0',
                fontSize: '1.2rem',
                color: colors.accent,
                fontWeight: 500,
              }}
            >
              Phases & KPIs
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1.3rem 1.4rem',
                  borderRadius: '18px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: colors.hint,
                    marginBottom: '0.3rem',
                  }}
                >
                  Phase 1 · Q1 2025
                </div>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  MVP: map, collection, treasury
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    color: colors.hint,
                  }}
                >
                  <li>• 10–20 NFTs live on mainnet.</li>
                  <li>• Mini App with map, roadmap & treasury view.</li>
                  <li>• Royalty splitter deployed and tested with real claims.</li>
                  <li>• /verify bot for holders + first curated holders group.</li>
                </ul>
                <div
                  style={{
                    marginTop: '0.7rem',
                    fontSize: '0.8rem',
                    color: colors.positive,
                  }}
                >
                  KPI: 20+ verified holders · 0.5 TON in treasury
                </div>
              </div>

              <div
                style={{
                  padding: '1.3rem 1.4rem',
                  borderRadius: '18px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: colors.hint,
                    marginBottom: '0.3rem',
                  }}
                >
                  Phase 2 · Q2 2025
                </div>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Growth & community
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    color: colors.hint,
                  }}
                >
                  <li>• Scale collection towards 100 NFTs.</li>
                  <li>• Enhanced TMA: profiles, notifications, social touches.</li>
                  <li>• Regular holder votes for next styles and locations.</li>
                  <li>• Partnerships with TON projects & art channels.</li>
                </ul>
                <div
                  style={{
                    marginTop: '0.7rem',
                    fontSize: '0.8rem',
                    color: colors.positive,
                  }}
                >
                  KPI: 100+ NFTs · 50+ active holders · 2+ TON in treasury
                </div>
              </div>

              <div
                style={{
                  padding: '1.3rem 1.4rem',
                  borderRadius: '18px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: colors.hint,
                    marginBottom: '0.3rem',
                  }}
                >
                  Phase 3 · Q3–Q4 2025
                </div>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  Platform & creator tools
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    color: colors.hint,
                  }}
                >
                  <li>• Expand to new cities (Kraków, Berlin and beyond).</li>
                  <li>• “Create your Urban Dream” tools for guest artists.</li>
                  <li>• SubCoin / points layer backed by treasury & royalties.</li>
                  <li>• IRL integrations: QR codes on locations, cafes, galleries.</li>
                </ul>
                <div
                  style={{
                    marginTop: '0.7rem',
                    fontSize: '0.8rem',
                    color: colors.positive,
                  }}
                >
                  KPI: 500+ NFTs · 200+ holders · 10+ TON treasury
                </div>
              </div>
            </div>
          </div>
        </SnapSection>

        {/* 6 · Art direction & principles */}
        <SnapSection index={5}>
          <div>
            <div
              style={{
                padding: '1.5rem 1.6rem',
                borderRadius: '18px',
                background: colors.card,
                border: `1px solid ${colors.border}`,
                marginBottom: '1rem',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: '0.8rem',
                  fontSize: '1.2rem',
                  color: colors.accent,
                  fontWeight: 500,
                }}
              >
                Collection & art direction
              </h3>
              <p
                style={{
                  margin: '0 0 0.7rem 0',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  color: colors.hint,
                }}
              >
                Each NFT is a curated fusion of:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: colors.hint,
                }}
              >
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>Urban photo</strong> from Warsaw — a corner, street
                  or hidden spot that carries a mood.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>Public-domain / CC0 art style</strong> — Van Gogh,
                  Symbolism, Cubism, digital glitch, cyberpunk, and more.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>Metadata</strong> with coordinates, art reference
                  and a short story about the place.
                </li>
                <li>
                  • The collection grows slowly —{' '}
                  <strong>2–4 pieces per week</strong>, focusing on story over
                  hype.
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: '1.6rem 1.6rem',
                borderRadius: '18px',
                background: colors.card,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: '0.8rem',
                  fontSize: '1.2rem',
                  color: colors.accentSoft,
                  fontWeight: 500,
                }}
              >
                Principles we build on
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: colors.hint,
                }}
              >
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>Place has soul.</strong> Coordinates are culture;
                  location is part of the artwork.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>History is a palette.</strong> Public-domain art is
                  a commons to re-interpret, not exploit.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>Access is sacred.</strong> Everything important
                  should be reachable via Telegram in a few taps.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>Transparency by design.</strong> Clear supply,
                  royalties, treasury stats, and public roadmaps.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  • <strong>Ethics in public space.</strong> No creepy shots,
                  respect privacy, credit sources.
                </li>
                <li>
                  • <strong>Co-created future.</strong> Over time, holders help
                  steer styles, locations, and treasury use.
                </li>
              </ul>

              <div
                style={{
                  marginTop: '1.1rem',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  opacity: 0.8,
                }}
              >
                “Urban dreams whisper promises of success, yet the true escape
                lies in the quiet embracing of horizons.”
              </div>
            </div>
          </div>
        </SnapSection>
      </div>
    </UrbanLayout>
  );
}
