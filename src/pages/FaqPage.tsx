import { useState } from 'react';
import { UrbanLayout } from '@/components/UrbanLayout';

const colors = {
  bg: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
  card: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.1)',
  text: '#f5f5f5',
  hint: '#d8d8d8',
  accentSoft: '#B069DB',
};

function FaqItem({
  question,
  children,
  defaultOpen = false,
}: {
  question: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      borderRadius: '18px',
      background: colors.card,
      border: `1px solid ${colors.border}`,
      padding: '1rem',
      marginBottom: '1rem',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          color: colors.text,
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {question}
        <span style={{ opacity: 0.6 }}>{open ? '–' : '+'}</span>
      </button>

      {open && (
        <div style={{ marginTop: '0.6rem', color: colors.hint, lineHeight: 1.6 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function FaqPage() {
  return (
    <UrbanLayout allowScroll title="FAQ">
      <div style={{ minHeight: '100vh', background: colors.bg }}>
        <div style={{ maxWidth: '680px', margin: '5rem auto', padding: '2rem 1rem' }}>

          <FaqItem question="What is Urban Dreams?" defaultOpen>
            Urban Dreams is a map-native NFT collection on TON.
            Each NFT represents a real Warsaw location reimagined through art.
          </FaqItem>

          <FaqItem question="What makes these NFTs different?">
            Every NFT is 1/1 by real-world coordinates.
            You collect a specific place, not a random variation.
          </FaqItem>

          <FaqItem question="How do I buy an NFT?">
            NFTs can be bought or bid on via Getgems.
            New drops are announced through the Telegram Mini App.
          </FaqItem>

          <FaqItem question="What do holders get?">
            Holders own a unique artwork, get early access to updates,
            participate in the treasury and future community decisions.
          </FaqItem>

          <FaqItem question="What is the treasury?">
            50% of secondary sale royalties flow into a shared on-chain treasury.
            When epochs are created, holders can claim their share.
          </FaqItem>

          <FaqItem question="How does rarity work?">
            Rarity is based on traits like district, style and atmosphere,
            but every NFT remains unique due to its coordinates.
          </FaqItem>

          <FaqItem question="How many NFTs will exist?">
            The Warsaw Edition is planned to grow to around 100 curated items.
          </FaqItem>

          <FaqItem question="Is this a financial product?">
            No. Urban Dreams is a digital art project with transparent mechanics,
            not a promise of profit.
          </FaqItem>

          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            opacity: 0.7,
            color: colors.hint,
          }}>
            Last updated on January 2026
          </div>
        </div>
      </div>
    </UrbanLayout>
  );
}
