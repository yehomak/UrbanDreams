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
            Urban Dreams is a map-native NFT collection.
            Each NFT is anchored to a real city location and reimagined through art,
            capturing the mood, memory and atmosphere of the place.
          </FaqItem>

          <FaqItem question="What makes Urban Dreams different?">
            Every NFT represents a real-world coordinate.
            This is not a generative drop — you collect a specific place in the city,
            not a random variation.
          </FaqItem>

          <FaqItem question="What does owning an NFT mean?">
            You own a 1/1 artwork linked to a real location,
            become part of the project history,
            and participate in the long-term evolution of the collection.
          </FaqItem>

          <FaqItem question="How do I buy an NFT?">
            NFTs are available on Getgems via fixed price or auction.
            New items and updates are announced through the Telegram Mini App
            and the official channel.
          </FaqItem>

          <FaqItem question="What is the treasury?">
            50% of secondary sale royalties are accumulated
            in a shared on-chain treasury.
            Periodically, epochs are created and funds can be claimed
            by holders and the creator.
          </FaqItem>

          <FaqItem question="What do holders get?">
            • A unique 1/1 artwork
            • Participation in the on-chain treasury  
            • Early access to new drops and features  
            • A voice in future project directions
          </FaqItem>

          <FaqItem question="How does rarity work?">
            Rarity emerges from a combination of style, district
            atmosphere, time and weather.
            However, every NFT remains unique due to its real coordinates.
          </FaqItem>

          <FaqItem question="How many NFTs will exist?">
            The Warsaw edition is planned to grow organically
            to around 100 curated items.
            There is no fixed release schedule.
          </FaqItem>

          <FaqItem question="Is this an investment or financial product?">
            No.
            Urban Dreams is an art and culture project with transparent mechanics.
            There are no promises of profit or guaranteed returns.
          </FaqItem>

          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            opacity: 0.7,
            color: colors.hint,
          }}>
            Last updated on February 2026
          </div>

        </div>
      </div>
    </UrbanLayout>
  );
}
