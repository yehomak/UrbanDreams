// src/pages/VisionPage/VisionPage.tsx
import { useEffect, useRef, useState } from 'react';
import { UrbanLayout } from '@/components/UrbanLayout';

const colors = {
  bg: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
  card: 'rgba(255,255,255,0.05)',
  cardSoft: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.1)',
  text: '#f5f5f5',
  hint: '#d8d8d8',
  accent: '#6ab3f3',
  accentSoft: '#B069DB',
  positive: '#4CAF50',
};

type SectionProps = {
  index: number;
  children: React.ReactNode;
};

function VisionSection({ index, children }: SectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(index === 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            setVisible(true);
          }
        });
      },
      { threshold: [0.2, 0.4] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        margin: '0 auto 2.5rem',
        maxWidth: '680px',
        padding: '0 0.5rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {children}
    </section>
  );
}

export function VisionPage() {
  return (
    <UrbanLayout allowScroll={true}>
      <div
        style={{
          marginTop: '17%',
          padding: '3rem 0.8rem',
          paddingTop: '4rem',
          color: colors.text,
          background: colors.bg,
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Origin story */}
        <VisionSection index={0}>
          <div
            style={{
              padding: '2rem 1.3rem',
              borderRadius: '22px',
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
                marginBottom: '0.9rem',
                fontSize: '0.75rem',
              }}
            >
              <span
                style={{
                  padding: '0.22rem 0.7rem',
                  borderRadius: '999px',
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(0,0,0,0.35)',
                }}
              >
                Intro
              </span>
              <span
                style={{
                  padding: '0.22rem 0.7rem',
                  borderRadius: '999px',
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(0,0,0,0.35)',
                }}
              >
                Components
              </span>
              <span
                style={{
                  padding: '0.22rem 0.7rem',
                  borderRadius: '999px',
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(0,0,0,0.35)',
                }}
              >
                Roadmap
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                color: "#d8d8d8",
                fontSize: '1.6rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              How this project really started
            </h2>

            <p
              style={{
                marginTop: '1rem',
                marginBottom: '0.9rem',
                fontSize: '1.05rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              Urban Dreams began in a quiet backyard of Warsaw city centre. 
              I was sitting on a bench with a friend on a warm summer afternoon, surrounded by old residential buildings and trees leaning in from every side.
              Their shadows drifted across the brick, blending into accidental composition. 
              <br/>For a moment, it felt like the city was already painting itself.
              Then idea arose: take a real place, mix it with appropriate art,
              and let imagination do the rest.
            </p>
          </div>
        </VisionSection>

        {/* 2. Why it exists */}
        <VisionSection index={1}>
          <div
            style={{
              padding: '1.9rem 1.7rem',
              borderRadius: '20px',
              background: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '0.8rem',
                fontSize: '1.5rem',
                color: "#d8d8d8",
                fontWeight: 500,
              }}
            >
              Why Urban Dreams exists
            </h3>

            <p
              style={{
                margin: '0 0 0.8rem 0',
                fontSize: '1.1rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              Cities carry memory: sounds, corners, bridges, courtyards you
              pass every day and never really see. Photos catch reality for a
              moment. Art lets that reality breathe.
            </p>

            <p
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                lineHeight: 1.5,
                color: colors.hint,
              }}
            >
              Urban Dreams turns real places into digital memories — each NFT
              tied to coordinates, reimagined through art, and preserved
              on-chain.
            </p>

            <div
              style={{
                display: 'grid',
                gap: '0.8rem',
                marginTop: '0.5rem',
                fontSize: '0.88rem',
              }}
            >
            </div>
          </div>
        </VisionSection>

        {/* 3. What we’re building */}
        <VisionSection index={2}>
          <div>
            <h3
              style={{
                margin: '0 1rem 2rem 0',
                fontSize: '1.4rem',
                color: "#d8d8d8",
                fontWeight: 500,
              }}
            >
              What are the project components?
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '1.3rem',
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: colors.hint,
                    marginBottom: '0.4rem',
                  }}
                >
                  1. NFT collection
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: colors.hint,
                  }}
                >
                  Each piece is a real Warsaw location blended with a carefully
                  curated style and short context. No mass minting,
                  just a slow-growing series with intention behind every item.
                </p>
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: colors.hint,
                    marginBottom: '0.4rem',
                  }}
                >
                  2. Map-native experience
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: colors.hint,
                  }}
                >
                  The Telegram Mini App shows the collection on a city map. You
                  do not just scroll images — you explore where they live in
                  the real world.
                </p>
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: colors.hint,
                    marginBottom: '0.4rem',
                  }}
                >
                  3. Transparent treasury
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: colors.hint,
                  }}
                >
                  Secondary Sales feed a shared treasury. Half of the flow is
                  distributed to holders through on-chain epochs, half goes
                  back into art, development and growth. Claim your share in our TMA in couple of clicks. Numbers stay visible.
                </p>
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
                    fontSize: '1.05rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: colors.hint,
                    marginBottom: '0.4rem',
                  }}
                >
                  4. holder-guided direction
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: colors.hint,
                  }}
                >
                  Over time, holders help decide locations, styles and feature
                  priority. The project starts curated and gradually becomes a
                  guided collaboration instead of a one-person show.
                </p>
              </div>
            </div>
          </div>
        </VisionSection>

        {/* 4. Roadmap snapshot */}
        <VisionSection index={3}>
          <div
            style={{
              padding: '1.8rem 1.7rem',
              borderRadius: '20px',
              background: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '1.3rem',
                fontSize: '1.5rem',
                color: "#d8d8d8",
                fontWeight: 500,
              }}
            >
              Project Roadmap
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '1.2rem',
                fontSize: '0.9rem',
                color: colors.hint,
              }}
            >
              <div
                style={{
                  padding: '1rem 1rem',
                  borderRadius: '14px',
                  background: colors.cardSoft,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                  }}
                >
                  2025 · Foundation
                </div>
                <ul
                  style={{
                    fontSize: '1.1rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  <li>  Develop Project Concept: </li>
                  <li>• Treasury Contract</li>
                  <li>• NFT Collection</li>
                  <li>• Telegram Mini App.</li>
                </ul>
              </div>

              <div
                style={{
                  padding: '1rem 1rem',
                  borderRadius: '14px',
                  background: colors.cardSoft,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                  }}
                >
                  Late 2025 · Growth
                </div>
                <ul
                  style={{
                    fontSize: '1.1rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  <li>• Approach ~100 NFTs for Warsaw Edition.</li>
                  <li>• Regular holder voting and treasury updates.</li>
                  <li>• Deeper TMA features: profiles, stats, filters.</li>
                  <li>• First collabs and IRL experiments.</li>
                </ul>
              </div>

              <div
                style={{
                  padding: '1rem 1rem',
                  borderRadius: '14px',
                  background: colors.cardSoft,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                  }}
                >
                  2026+ · Network of cities
                </div>
                <ul
                  style={{
                    fontSize: '1.1rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  <li>• New city editions (Barcelona, Paris, others).</li>
                  <li>• Creator tools for guest photographers and artists.</li>
                  <li>• Refining governance into a soft DAO model.</li>
                  <li>• More bridges between streets, galleries and chain.</li>
                </ul>
              </div>
            </div>

            <div
              style={{
                marginTop: '1rem',
                fontSize: '0.83rem',
                color: colors.positive,
              }}
            >
              The plan is a guide, not a prison. If the community pulls in a
              better direction, we listen.
            </div>
          </div>
        </VisionSection>

        {/* 5. Values & closing */}
        <VisionSection index={4}>
          <div>
            <h3
              style={{
                margin: '0 0 0.8rem 0',
                fontSize: '1.2rem',
                color: colors.accentSoft,
                fontWeight: 500,
              }}
            >
              What this project tries to protect
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
                  fontSize: '0.95rem',
                  color: colors.hint,
                  lineHeight: 1.6,
                }}
              >
                <strong>Authenticity over speed.</strong>{' '}
                The project grows at a human pace. No forced drops, no
                artificial urgency.
              </div>

              <div
                style={{
                  padding: '1.1rem 1.2rem',
                  borderRadius: '16px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  fontSize: '0.95rem',
                  color: colors.hint,
                  lineHeight: 1.6,
                }}
              >
                <strong>Place as a first-class citizen.</strong>{' '}
                Coordinates are not decoration. They are part of the artwork
                and story.
              </div>

              <div
                style={{
                  padding: '1.1rem 1.2rem',
                  borderRadius: '16px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  fontSize: '0.95rem',
                  color: colors.hint,
                  lineHeight: 1.6,
                }}
              >
                <strong>Transparency in economics.</strong>{' '}
                How value moves is visible: treasury, epochs, distributions.
                No black boxes.
              </div>

              <div
                style={{
                  padding: '1.1rem 1.2rem',
                  borderRadius: '16px',
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  fontSize: '0.95rem',
                  color: colors.hint,
                  lineHeight: 1.6,
                }}
              >
                <strong>Community as co-author.</strong>{' '}
                Over time, holders influence locations, styles and features.
                The city is not told to them; it is written with them.
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              opacity: 0.8
            }}>
              <p style={{ marginBottom: '1rem', fontSize: '1.2rem', fontFamily: 'Cursive' }}>
                Urban dreams whisper promises of success, yet the true escape lies in the quiet embracing of horizons.
              </p>
              <div style={{ fontSize: '2rem', opacity: 0.6 }}>
                🌙 🏙️ ✨
              </div>
            </div>
          </div>
        </VisionSection>
      </div>
    </UrbanLayout>
  );
}
