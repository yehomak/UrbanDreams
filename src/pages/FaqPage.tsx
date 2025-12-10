// src/pages/FaqPage/FaqPage.tsx
import { useState } from 'react';
import { UrbanLayout } from '@/components/UrbanLayout';

const colors = {
  bg: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
  card: 'rgba(255,255,255,0.05)',
  cardSoft: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.1)',
  text: '#f5f5f5',
  hint: '#9aa7bd',
  accent: '#6ab3f3',
  accentSoft: '#B069DB',
};

type FaqItemProps = {
  question: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FaqItem({ question, children, defaultOpen = false }: FaqItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderRadius: '17px',
        background: colors.card,
        border: `1px solid ${colors.border}`,
        padding: '1rem 1.1rem',
        marginBottom: '1.1rem',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          padding: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: "#d8d8d8",
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontSize: '1.3rem',
            fontWeight: 500,
          }}
        >
          {question}
        </span>
        <span
          style={{
            marginLeft: '0.75rem',
            fontSize: '1.2rem',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: colors.hint,
          }}
        >
          ▸
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? '400px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.25s ease',
        }}
      >
        <div
          style={{
            marginTop: '0.6rem',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: "#d8d8d8",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function FaqPage() {
  return (
    <UrbanLayout allowScroll={true}>
      <div
        style={{
          minHeight: '100vh',
          background: colors.bg,
          color: colors.text,
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            margin: '5rem auto 2rem',
            padding: '3rem 1rem 2.5rem',
          }}
        >

          {/* Section: Basics */}
          <div
            style={{
              marginBottom: '3.1rem',
            }}
          >
            <h3
              style={{
                margin: '0rem 3rem 1.5rem 0',
                fontSize: '1.7rem',
                color: colors.accentSoft,
                fontWeight: 400,
              }}
            >
              Concept
            </h3>

            <FaqItem question="What is Urban Dreams?" defaultOpen>
              <p style={{ margin: 0 }}>
                It’s a Web3 project that combines the power of blockchain and AI.
                Each NFT is a real location in the city, reimagined through art.
                Think of it as collecting city postcards, but on-chain
                additional perks tied to the project’s economy and community.
              </p>
            </FaqItem>

            <FaqItem question="What do NFT owners get?">
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Digital art piece</strong> – unique stylized artwork
                  representing a real location.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Revenue share</strong> – 50% of all secondary sales
                  royalties are distributed to holders via the treasury epochs.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Voting rights</strong> – choose locations, art styles,
                  and where parts of the treasury should go.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Community access</strong> – private chat for
                  verified holders.
                </li>
                <li>
                  • <strong>Collector flex</strong> – part of a limited series
                  (target supply: 100 NFTs in the Warsaw edition).
                </li>
              </ul>
            </FaqItem>

            <FaqItem question="How many NFTs will there be?">
              <p style={{ margin: 0 }}>
                The collection grows with the city. We’re starting with Warsaw and
                aiming for around 100 NFTs by Q1 2026. The approach is slow and
                curated – quality over quantity, story over spam.
              </p>
            </FaqItem>

            <FaqItem question="How do I get a piece?">
              <p style={{ marginBottom: '0.5rem' }}>
                There are two main ways to become a holder:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Mint</strong> directly in the Telegram Mini App when
                  drops are open.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Buy on secondary</strong> markets like Getgems.
                </li>
              </ul>
              <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
                Connect your TON wallet, pick a place you vibe with, and secure
                your piece of the city. Early drops usually go first to our OG
                supporters.
              </p>
            </FaqItem>
          </div>

          {/* Section: Ownership & blockchain */}
          <div
            style={{
              marginBottom: '1.8rem',
            }}
          >
            <h3
              style={{
                margin: '0rem 3rem 1.5rem 0',
                fontSize: '1.7rem',
                color: colors.accentSoft,
                fontWeight: 400,
              }}
            >
              Ownership & blockchain
            </h3>

            <FaqItem question="How do I verify as a holder?">
              <ol
                style={{
                  margin: 0,
                  paddingLeft: '2rem',
                }}
              >
                <li>Acquire at least one Urban Dreams NFT.</li>
                <li>DM the bot with <code>/verify</code>.</li>
                <li>Get your holder role and access to the private chat.</li>
              </ol>
            </FaqItem>

            <FaqItem question="Which blockchain do you use?">
              <p style={{ margin: 0 }}>
                Urban Dreams lives on <strong>TON (The Open Network)</strong> –
                a fast, low-fee, and eco-friendly blockchain originally built
                around the Telegram ecosystem.
              </p>
            </FaqItem>

            <FaqItem question="Are these legit TON NFTs?">
              <p style={{ margin: 0 }}>
                Yes. The collection uses standard TON NFT contracts, so your NFTs
                work across TON wallets and marketplaces and can be shown as PFPs
                or in galleries. Royalty splits are handled automatically by smart
                contracts.
              </p>
            </FaqItem>

            <FaqItem question="Where do the NFT images live? Are they safe?">
              <p style={{ margin: 0 }}>
                Images and metadata are pinned to <strong>IPFS</strong> across
                multiple nodes. That means the files are stored in a decentralized
                way rather than on a single server, making them more resilient and
                portable across platforms.
              </p>
            </FaqItem>
          </div>

          {/* Section: Locations & art */}
          <div
            style={{
              marginBottom: '1.8rem',
            }}
          >
            <h3
              style={{
                margin: '0rem 3rem 1.5rem 0',
                fontSize: '1.7rem',
                color: colors.accentSoft,
                fontWeight: 400,
              }}
            >
              Locations & art
            </h3>

            <FaqItem question="How are locations chosen?">
              <p style={{ marginBottom: '0.5rem' }}>
                Locations are chosen through a mix of curation and community:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Curator picks</strong> – founder’s initial selection
                  of meaningful spots.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Community suggestions</strong> – holders can propose
                  their favorite places.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Holder votes</strong> – community chooses which
                  districts or themes to explore next.
                </li>
                <li>
                  • <strong>Historical value</strong> – places with stories,
                  texture, and emotional weight.
                </li>
              </ul>
            </FaqItem>

            <FaqItem question="What art styles or artists are used?">
              <p style={{ marginBottom: '0.5rem' }}>
                For legal and ethical reasons, the focus is on:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: '0.35rem' }}>
                  • <strong>Public domain artists</strong> (typically 70+ years
                  after death).
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • Open-license works that allow creative reuse.
                </li>
              </ul>
              <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
                Examples include Van Gogh, Monet, Malevich, and early 20th-century
                Polish painters, as well as carefully chosen digital styles that
                respect those roots.
              </p>
            </FaqItem>

            <FaqItem question="Can I suggest my favorite spot?">
              <p style={{ margin: 0 }}>
                Yes. Share it in the community chat or during holder discussions.
                The most interesting locations often start as “hey, this corner
                of the city feels special…” messages.
              </p>
            </FaqItem>
          </div>

          {/* Section: Community & governance */}
          <div
            style={{
              marginBottom: '1.8rem',
            }}
          >
            <h3
              style={{
                margin: '0rem 3rem 1.5rem 0',
                fontSize: '1.7rem',
                color: colors.accentSoft,
                fontWeight: 400,
              }}
            >
              Community & governance
            </h3>

            <FaqItem question="What voting power do holders get?">
              <p style={{ marginBottom: '0.5rem' }}>
                Voting will evolve, but core areas include:
              </p>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: '1.1rem',
                }}
              >
                <li>Location picks – which spots become NFTs next.</li>
                <li>Style choices – which artists or styles to feature.</li>
                <li>Feature priority – what to build into the Mini App first.</li>
                <li>Other project polls and experiments.</li>
              </ol>
            </FaqItem>

            <FaqItem question="Is there a private chat for holders?">
              <p style={{ marginBottom: '0.35rem' }}>
                Yes. After verification via the bot, you get access to a
                holders-only chat where we:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: '0.35rem' }}>
                  • Discuss project development and upcoming drops.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • Talk about cities, art, crypto, and everything in between.
                </li>
                <li>• Share early previews and small project “treasures”.</li>
              </ul>
            </FaqItem>
          </div>

          {/* Section: Legitimacy & rights */}
          <div
            style={{
              marginBottom: '1.8rem',
            }}
          >
            <h3
              style={{
                margin: '0rem 3rem 1.5rem 0',
                fontSize: '1.7rem',
                color: colors.accentSoft,
                fontWeight: 400,
              }}
            >
              Legitimacy & rights
            </h3>

            <FaqItem question="Is this a pyramid scheme?">
              <p style={{ marginBottom: '0.5rem' }}>
                No. Urban Dreams is structured as a{' '}
                <strong>revenue-sharing digital art project</strong>, closer to a
                dividend-style model than any kind of referral scheme.
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: '0.35rem' }}>
                  • There’s a real product: NFT art bound to real locations.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • Income depends on actual market demand, not on recruiting new
                  buyers.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • No mandatory referrals or “invite quotas”.
                </li>
                <li>
                  • On-chain contracts and treasury stats keep the economics
                  transparent.
                </li>
              </ul>
            </FaqItem>

            <FaqItem question="Can I use NFTs commercially?">
              <p style={{ marginBottom: '0.5rem' }}>
                NFTs are planned under a{' '}
                <strong>CC BY-NC 4.0–style license</strong>, which in plain
                language means:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: '0.35rem' }}>
                  • You can use your NFT image for non-commercial purposes.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • You can print it on merch (posters, shirts) for personal or
                  small community use.
                </li>
                <li style={{ marginBottom: '0.35rem' }}>
                  • You should credit <strong>Urban Dreams</strong> when you use
                  it.
                </li>
                <li>
                  • Selling derivative works as a separate product is not allowed
                  under the non-commercial terms.
                </li>
              </ul>
            </FaqItem>
          </div>

          {/* Footer note */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 0.5rem 0',
              borderTop: `1px dashed ${colors.border}`,
              fontSize: '0.8rem',
              color: colors.hint,
              textAlign: 'center',
            }}
          >
            More questions? Drop them in the channel or holder chat – we usually
            reply within 24h. 🏛️✨
            <div style={{ marginTop: '0.4rem', opacity: 0.7 }}>
              Last updated: March 2025
            </div>
          </div>
        </div>
      </div>
    </UrbanLayout>
  );
}
