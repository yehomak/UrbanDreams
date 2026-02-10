// src/pages/TreasuryPage/TreasuryPage.tsx
import { UrbanLayout } from '@/components/UrbanLayout';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect, useMemo, useState } from 'react';

const colors = {
  bgGradient: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
  glassBg: 'rgba(255,255,255,0.05)',
  glassInner: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.12)',
  text: '#f5f5f5',
  hint: '#d8d8d8',
  accent: '#6ab3f3',
  positive: '#4CAF50',
  danger: '#ec3942',
};

const TONCENTER_ENDPOINT =
  'https://toncenter.com/api/v2/getAddressInformation';
const TREASURY_ADDR = 'EQAVTTNZ0OmGZVSY4mv0kRffne-ViaeX8RJ-i-RD1Ppt8PkU';

// optional: set in env as VITE_TONCENTER_API_KEY
const TONCENTER_KEY = import.meta.env.TONAPI_KEY as string | undefined;

const CACHE_KEY = `ud:treasury:addrinfo:${TREASURY_ADDR}`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const KEEP_ALIVE_TON = 0.99;

function nanoToTon(nano: bigint) {
  return Number(nano) / 1e9;
}

type ToncenterAddrInfoResponse = {
  ok: boolean;
  result?: {
    balance?: string; // nanotons as decimal string
    state?: string;
    sync_utime?: number;
  };
  error?: string;
};

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; v: T };
    if (!parsed?.t) return null;
    if (Date.now() - parsed.t > CACHE_TTL_MS) return null;
    return parsed.v;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // ignore quota / private mode issues
  }
}

export function TreasuryPage() {
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  const [balanceTon, setBalanceTon] = useState<string>('—');
  const [animatedBalance, setAnimatedBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const walletAddr = wallet?.account.address ?? null;

  const walletShort = useMemo(() => {
    if (!walletAddr) return null;
    return `${walletAddr.slice(0, 4)}...${walletAddr.slice(-7)}`;
  }, [walletAddr]);

  // fetch + 24h cache
  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setErr(null);

      // 1) try cache first
      const cached = readCache<ToncenterAddrInfoResponse>(CACHE_KEY);
      if (cached?.ok && cached.result?.balance) {
        console.log('cached');
        const rawTon = nanoToTon(BigInt(cached.result.balance));
        const displayTon = Math.max(0, rawTon - KEEP_ALIVE_TON).toFixed(2);
        setBalanceTon(displayTon);
        setLoading(false);
        // still can refresh in background if you want; keeping it simple: stop here
        return;
      }

      // 2) fetch from toncenter
      try {
        const url = new URL(TONCENTER_ENDPOINT);
        url.searchParams.set('address', TREASURY_ADDR);
        // API key can be api_key query param OR X-API-Key header
        if (TONCENTER_KEY) url.searchParams.set('api_key', TONCENTER_KEY);

        const res = await fetch(url.toString(), {
          signal: ac.signal,
          headers: {
            accept: 'application/json',
            ...(TONCENTER_KEY ? { 'X-API-Key': TONCENTER_KEY } : {}),
          },
        });

        if (!res.ok) throw new Error(`Toncenter error: ${res.status}`);

        const json = (await res.json()) as ToncenterAddrInfoResponse;

        if (!json.ok || !json.result?.balance) {
          throw new Error(json.error || 'Toncenter returned no balance');
        }

        writeCache(CACHE_KEY, json);

        const rawTon = nanoToTon(BigInt(json.result.balance));
        const displayTon = Math.max(0, rawTon - KEEP_ALIVE_TON).toFixed(2);

        setBalanceTon(displayTon);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setErr(e?.message ?? 'Failed to load treasury balance');
        setBalanceTon('—');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, []);

  // animate when balanceTon changes
  useEffect(() => {
    const target = parseFloat(balanceTon);
    if (!Number.isFinite(target)) return;

    const duration = 1200;
    let raf = 0;
    let start: number | null = null;

    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const cur = target * eased;
      setAnimatedBalance(cur.toFixed(2));
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [balanceTon]);

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
            <p style={{ color: colors.hint, fontSize: '1.1rem', lineHeight: 1.5, marginBottom: 0 }}>
              Half of all secondary sales is accumulated here.
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
              <div style={valueStyle()}>
                {loading ? '—' : `${animatedBalance} TON`}
              </div>
              {/* <div style={hintStyle()}>
                {err ? <span style={{ color: colors.danger }}>{err}</span> : 'Toncenter (cached 24h)'}
              </div> */}
            </div>

            <div style={cardStyle()}>
              <div style={labelStyle()}>Distribution Date</div>
              <div style={valueStyle()}>12/3/2026</div>
            </div>

            <div style={cardStyle()}>
              <div style={labelStyle()}>Current Epoch</div>
              <div style={valueStyle()}>—</div>
              {/* <div style={hintStyle()}>Distribution cycle</div> */}
            </div>

            <div style={cardStyle()}>
              <div style={labelStyle()}>Your Wallet</div>
              <div style={{ ...valueStyle(), fontSize: '1.1rem' }}>
                {walletShort ?? '—'}
              </div>
              <div style={hintStyle()}>
                {wallet ? 'Connected' : 'Connect to claim later'}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section style={boxStyle()}>
            <h3 style={sectionTitle()}>How it works:</h3>
            <ol style={listStyle()}>
              <li>Royalties flow in from secondary sales.</li>
              <li>A snapshot (epoch) fixes the holder list on specified distribution date.</li>
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
              <button onClick={() => tonConnectUi.openModal()} style={ctaButton()}>
                Connect Wallet
              </button>
            ) : (
              <p style={{ textAlign: 'center', color: colors.hint, margin: 0, lineHeight: 1.5 }}>
                Wallet connected.
                <br />
                Claims will open after the first mainnet epoch.
              </p>
            )}
          </section>

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
  margin: 0,
});

const hintBlock = () => ({
  marginTop: '0.8rem',
  fontSize: '0.9rem',
  opacity: 0.8,
  color: '#d8d8d8',
  marginBottom: 0,
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
