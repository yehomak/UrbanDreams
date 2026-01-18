import { UrbanLayout } from '@/components/UrbanLayout';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

const colors = {
  bgGradient: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
  glassBg: 'rgba(255,255,255,0.05)',
  glassInner: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.12)',
  text: '#f5f5f5',
  hint: '#d8d8d8',
  accent: '#6ab3f3',
  positive: '#4CAF50',
};

export function TreasuryPage() {
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  const [balanceTon, setBalanceTon] = useState('0.00');

  useEffect(() => {
    // mock for now — replace with your real tonapi fetch
    setBalanceTon('0.00');
  }, []);

  return (
    <UrbanLayout allowScroll title="Treasury">
      <div
        style={{
          minHeight: '100vh',
          background: colors.bgGradient,
          color: colors.text,
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: '620px', margin: '6rem auto 3rem' }}>
          {/* HERO */}
          <section
            style={{
              padding: '2rem',
              borderRadius: '22px',
              background: colors.glassBg,
              border: `1px solid ${colors.border}`,
              marginBottom: '1.6rem',
              textAlign: 'center',
            }}
          >
            <h2 style={{ marginTop: 0, fontWeight: 400, fontSize: '2rem' }}>
              Treasury
            </h2>
            <p style={{ color: colors.hint, fontSize: '1.1rem', lineHeight: 1.5 }}>
              The shared engine behind Urban Dreams.  
              50% of secondary sale royalties flow here before being distributed to holders.
            </p>
          </section>

          {/* OVERVIEW */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={cardStyle()}>
              <div style={labelStyle()}>Treasury Balance</div>
              <div style={valueStyle()}>{balanceTon} TON</div>
              <div style={hintStyle()}>On-chain contract balance</div>
            </div>

            <div style={cardStyle()}>
              <div style={labelStyle()}>Next Epoch</div>
              <div style={valueStyle()}>≥ 10 TON</div>
              <div style={hintStyle()}>Snapshot condition</div>
            </div>

            <div style={cardStyle()}>
              <div style={labelStyle()}>Current Epoch</div>
              <div style={valueStyle()}>—</div>
              <div style={hintStyle()}>Distribution cycle</div>
            </div>

            <div style={cardStyle()}>
              <div style={labelStyle()}>Total Distributed</div>
              <div style={valueStyle()}>—</div>
              <div style={hintStyle()}>After first payout</div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section style={boxStyle()}>
            <h3 style={sectionTitle()}>How it works</h3>
            <ol style={listStyle()}>
              <li>Royalties flow in from secondary sales.</li>
              <li>A snapshot (epoch) fixes the holder list.</li>
              <li>Holders claim their share via wallet.</li>
            </ol>
            <p style={hintBlock()}>
              Your share depends on how many NFTs you hold at snapshot time.
            </p>
          </section>

          {/* WALLET */}
          <section style={{ ...boxStyle(), marginTop: '1.5rem' }}>
            <h3 style={sectionTitle()}>Wallet & Claims</h3>

            {!wallet ? (
              <button
                onClick={() => tonConnectUi.openModal()}
                style={ctaButton()}
              >
                Connect Wallet
              </button>
            ) : (
              <p style={{ textAlign: 'center', color: colors.hint }}>
                Wallet connected.  
                Claims will open after the first epoch.
              </p>
            )}
          </section>

          {/* FOOTER */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '2.5rem',
              fontSize: '0.9rem',
              color: colors.hint,
              opacity: 0.8,
            }}
          >
            Treasury is the economic memory of the project — slow, visible, shared.
          </div>
        </div>
      </div>
    </UrbanLayout>
  );
}

/* --- styles --- */
const cardStyle = () => ({
  padding: '1.2rem',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  textAlign: 'center' as const,
});

const labelStyle = () => ({
  fontSize: '0.9rem',
  color: '#d8d8d8',
  marginBottom: '0.3rem',
});

const valueStyle = () => ({
  fontSize: '1.5rem',
  fontWeight: 500,
});

const hintStyle = () => ({
  fontSize: '0.8rem',
  opacity: 0.7,
});

const boxStyle = () => ({
  padding: '1.6rem',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
});

const sectionTitle = () => ({
  marginTop: 0,
  marginBottom: '0.8rem',
  fontWeight: 400,
});

const listStyle = () => ({
  paddingLeft: '1.2rem',
  lineHeight: 1.6,
  color: '#d8d8d8',
});

const hintBlock = () => ({
  marginTop: '0.8rem',
  fontSize: '0.9rem',
  opacity: 0.8,
});

const ctaButton = () => ({
  width: '100%',
  padding: '0.9rem',
  borderRadius: '999px',
  border: '1px solid #6ab3f3',
  background: 'transparent',
  color: '#6ab3f3',
  cursor: 'pointer',
  fontSize: '1rem',
});
