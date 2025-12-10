// src/pages/TreasuryPage/TreasuryPage.tsx
import { UrbanLayout } from '@/components/UrbanLayout';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import type { EpochClaimFile, EpochClaimHolder } from '@/types/epochs';
import { useLaunchParams } from '@/context/LaunchParamsContext';
import { RoyaltySplitterMerkle } from '@/wrappers/RoyaltySplitterMerkle';

const SPLITTER_ADDR = 'kQDLHmFHkuvqRTkDpcp-Id5liC6rfyWUXW3H3csQGTYXl8NJ';
const TONAPI_BASE = 'https://testnet.tonapi.io';

// ⚠️ FILL THESE WITH REAL OPCODES FROM YOUR RoyaltySplitterMerkle CONTRACT
const OP_SET_EPOCH = 0x00000000; // TODO: replace with your set_epoch op
const OP_CLAIM = 0x00000000;     // TODO: replace with your claim op


const TONAPI_KEY = import.meta.env.TONAPI_KEY as string | undefined;

type SplitterState = {
  // epochId: number;
  // keepAliveTon: string;
  // minPayoutTon: string;
  // perShareTon: string;
  // claimedCount: number;
  // rootHashHex: string;
  balanceTon: string;
};


const colors = {
  bgGradient: 'linear-gradient(180deg, #1a1f2e 0%, #232e3c 50%, #1a1f2e 100%)',
  glassBg: 'rgba(255,255,255,0.05)',
  glassInner: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.12)',
  text: '#f5f5f5',
  hint: '#708499',
  accent: '#6ab3f3',
  accentSoft: '#4CAF50',
  danger: '#ec3942',
  muted: '#d8d8d8',
};

type TonapiMsgData = {
  '@type': string;
  body?: string; // base64-encoded
  text?: string;
};

type TonapiMsg = {
  source?: { address: string };
  destination?: { address: string };
  value?: string;
  msg_data?: TonapiMsgData | null;
};

type TonapiTx = {
  hash: string;
  lt: string;
  utime: number;
  in_msg?: TonapiMsg | null;
};

type TonapiTxResponse = {
  transactions: TonapiTx[];
};

type EnrichedEpoch = {
  epoch: EpochClaimFile;
  holder?: EpochClaimHolder;
  claimed: boolean;
};

function parseOpFromBodyBase64(body?: string): number | null {
  if (!body) return null;
  try {
    const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
    if (bytes.length < 4) return null;
    // TON ints are big-endian
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return view.getUint32(0, false);
  } catch {
    return null;
  }
}

// Rebuild proof cell from array of "0x..." hex strings (same logic as in scripts)
const proofCellFromHex = (chain: string[]): Cell => {
  if (!chain || chain.length === 0) return new Cell();

  let cur: Cell | null = null;
  for (let i = chain.length - 1; i >= 0; i--) {
    let sibHex = chain[i];
    const sib = BigInt(sibHex); // "0x..." норм для BigInt
    const b = beginCell().storeUint(sib, 256);
    if (cur) b.storeRef(cur);
    cur = b.endCell();
  }

  return cur!;
};

const buildClaimPayloadBase64 = (epoch: EpochClaimFile, holder: EpochClaimHolder): string => {
  const proofCell = proofCellFromHex(holder.proof);

  const body = RoyaltySplitterMerkle.buildClaimBody({
    index: holder.index,
    proof: proofCell,
  });

  const boc = body.toBoc();
  return Buffer.from(boc).toString('base64');
};

function hexNumToBigInt(hex: string | undefined): bigint {
  if (!hex) return 0n;
  // "0x1234" → BigInt
  return BigInt(hex);
}

function hexNumToNumber(hex: string | undefined): number {
  return Number(hexNumToBigInt(hex));
}

function nanoToTon(nano: bigint): number {
  return (Number(nano) / 1e9);
}


export function TreasuryPage() {
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
  const lp = useLaunchParams();
  
  console.log('Launch params:', lp);
  console.log('Platform:', lp.tgWebAppPlatform);
  console.log('User:', lp.tgWebAppData?.user);

  const [epochs, setEpochs] = useState<EpochClaimFile[]>([]);
  const [loadingEpochs, setLoadingEpochs] = useState(true);
  const [epochsError, setEpochsError] = useState<string | null>(null);

  const [txs, setTxs] = useState<TonapiTx[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [txsError, setTxsError] = useState<string | null>(null);

  const [splitterState, setSplitterState] = useState<SplitterState | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [stateError, setStateError] = useState<string | null>(null);

  const [claimingEpochId, setClaimingEpochId] = useState<number | null>(null);
  const [animatedBalance, setAnimatedBalance] = useState('0.000');

  const walletAddr = wallet?.account.address ?? null;

  useEffect(() => {
    let cancelled = false;
  
    async function loadSplitterState() {
      try {
        setLoadingState(true);
        setStateError(null);
  
        // 1) Account data: balance
        const accUrl = `${TONAPI_BASE}/v2/blockchain/accounts/${SPLITTER_ADDR}`;
        const accRes = await fetch(accUrl, {
          headers: {
            accept: 'application/json',
            ...(TONAPI_KEY ? { Authorization: `Bearer ${TONAPI_KEY}` } : {}),
          },
        });
  
        if (!accRes.ok) {
          throw new Error(`Account fetch error: ${accRes.status}`);
        }
  
        const accJson = await accRes.json();

        console.log(accJson);
        const balanceNano = BigInt(accJson.balance ?? '0');
        const balanceTon = (nanoToTon(balanceNano) - 1).toFixed(2); // extract keep alive
  
        // 2) Run get_state (the same getter as wrapper.getState())
        // const methodUrl = `${TONAPI_BASE}/v2/blockchain/accounts/${SPLITTER_ADDR}/methods/get_state`;
        // const mRes = await fetch(methodUrl, {
        //   headers: {
        //     accept: 'application/json',
        //     ...(TONAPI_KEY ? { Authorization: `Bearer ${TONAPI_KEY}` } : {}),
        //   },
        // });
  
        // if (!mRes.ok) {
        //   throw new Error(`get_state error: ${mRes.status}`);
        // }
  
        // const mJson = await mRes.json();
        // const stack = mJson.stack as any[] | undefined;
  
        // if (!stack || stack.length < 6) {
        //   throw new Error('Unexpected get_state stack format');
        // }
  
        // ⚠️ ВАЖНО: порядок и типы должны совпасть с твоим get_state в FunC.
        // Предположим, что он возвращает:
        // (epochId, keepAlive, minPayout, perShare, claimedCount, rootHash)
        //
        // TonAPI обычно даёт:
        // stack[0].num = "0x..." (uint)
        // stack[1].num = "0x..." (nanotons)
        // ...
        // const epochId = hexNumToNumber(stack[0].num);
        // const keepAliveNano = hexNumToBigInt(stack[1].num);
        // const minPayoutNano = hexNumToBigInt(stack[2].num);
        // const perShareNano = hexNumToBigInt(stack[3].num);
        // const claimedCount = hexNumToNumber(stack[4].num);
        // const rootHashHex = String(stack[5].num ?? '0x0'); // or .cell if you return cell
  
        const s: SplitterState = {
          //epochId,
          //keepAliveTon: nanoToTonStr(keepAliveNano),
          //minPayoutTon: nanoToTonStr(minPayoutNano),
          //perShareTon: nanoToTonStr(perShareNano),
          //claimedCount,
          //rootHashHex,
          balanceTon,
        };
  
        if (!cancelled) {
          setSplitterState(s);
        }
      } catch (e: any) {
        if (!cancelled) {
          setStateError(e?.message ?? 'Failed to load splitter state');
        }
      } finally {
        if (!cancelled) {
          setLoadingState(false);
        }
      }
    }
  
    loadSplitterState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!splitterState) return;
  
    const target = parseFloat(splitterState.balanceTon || '0');
    if (isNaN(target)) return;
  
    const duration = 2500;
    let frameId: number;
    let startTime: number | null = null;
  
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
  
      // easeOutCubic for smooth finish
      const eased = 1 - Math.pow(1 - progress, 3);
  
      const current = 0 + (target - 0) * eased;
      setAnimatedBalance(current.toFixed(2));
  
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
  
    frameId = requestAnimationFrame(animate);
  
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [splitterState?.balanceTon]);  

  // --- load epoch_claim_X.json files from /epochs ---
  useEffect(() => {
    let cancelled = false;

    async function loadEpochs() {
      try {
        setLoadingEpochs(true);
        setEpochsError(null);

        const idxResp = await fetch('/epochs/index.json');
        if (!idxResp.ok) {
          console.error("cannot find file");
          throw new Error(`Failed to load /epochs/index.json: ${idxResp.status}`);
        }
        console.log(idxResp);
        const idxData: { epochs: string[] } = await idxResp.json();

        const loaded: EpochClaimFile[] = [];
        for (const fileName of idxData.epochs) {
          try {
            const res = await fetch(`/epochs/${fileName}`);
            if (!res.ok) continue;
            const json = (await res.json()) as EpochClaimFile;
            loaded.push(json);
          } catch {
            // ignore broken epoch files
          }
        }

        // sort by epochId
        loaded.sort((a, b) => a.epochId - b.epochId);

        if (!cancelled) {
          setEpochs(loaded);
        }
      } catch (e: any) {
        if (!cancelled) {
          setEpochsError(e?.message ?? 'Failed to load epochs');
        }
      } finally {
        if (!cancelled) {
          setLoadingEpochs(false);
        }
      }
    }

    loadEpochs();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- load last 100 transactions from testnet.tonapi.io for splitter ---
  // useEffect(() => {
  //   let cancelled = false;

  //   async function loadTxs() {
  //     try {
  //       setLoadingTxs(true);
  //       setTxsError(null);

  //       const url = `${TONAPI_BASE}/v2/blockchain/accounts/${SPLITTER_ADDR}/transactions?limit=100&offset=0`;
  //       const res = await fetch(url, {
  //         headers: {
  //           accept: 'application/json',
  //           ...(TONAPI_KEY ? { Authorization: `Bearer ${TONAPI_KEY}` } : {}),
  //         },
  //       });

  //       if (!res.ok) {
  //         throw new Error(`TonAPI error: ${res.status}`);
  //       }

  //       const data = (await res.json()) as TonapiTxResponse;
  //       console.log(data);
  //       if (!cancelled) {
  //         setTxs(data.transactions ?? []);
  //       }
  //     } catch (e: any) {
  //       if (!cancelled) {
  //         setTxsError(e?.message ?? 'Failed to load transactions');
  //       }
  //     } finally {
  //       if (!cancelled) {
  //         setLoadingTxs(false);
  //       }
  //     }
  //   }

  //   loadTxs();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  const walletShort = useMemo(() => {
    if (!walletAddr) return null;
    return `${walletAddr.slice(0, 4)}...${walletAddr.slice(-7)}`;
  }, [walletAddr]);

  // --- build enriched epochs with holder info & claimed status ---
  const enrichedEpochs: EnrichedEpoch[] = useMemo(() => {
    return epochs.map((epoch) => {
      if (!walletAddr) {
        return { epoch, claimed: false };
      }

      const holder = epoch.holders.find((h) => {
        try {
          const holderAddr = Address.parse(h.owner);
          const wallet = Address.parse(walletAddr!);
      
          // compare in raw format "0:abc..."
          return holderAddr.toRawString() === wallet.toRawString();
        } catch (e) {
          console.warn('Address parse failed', h.owner, walletAddr, e);
          return false;
        }
      });

      if (!holder) {
        return { epoch, holder: undefined, claimed: false };
      }

      // naive: consider claimed if we see any inbound tx to splitter
      // from this holder with CLAIM_OP
      const claimed = txs.some((tx) => {
        const msg = tx.in_msg;
        if (!msg) return false;
        if (!msg.source || msg.source.address !== walletAddr) return false;
        if (!msg.destination || msg.destination.address !== epoch.splitter) return false;
        const op = parseOpFromBodyBase64(msg.msg_data?.body);
        if (OP_CLAIM === 0 || OP_CLAIM === null) {
          // if op not configured, we can't be sure — default to "false"
          return false;
        }
        return op === OP_CLAIM;
      });

      return { epoch, holder, claimed };
    });
  }, [epochs, txs, walletAddr]);

  const currentEpoch = enrichedEpochs.length
    ? enrichedEpochs[enrichedEpochs.length - 1]
    : null;

  // sum of "claimable" for demo — you will replace with real per-share math
  const mockClaimable = useMemo(() => {
    if (!walletAddr || enrichedEpochs.length === 0) return '0';
    // just count epochs where holder exists and not claimed yet,
    // for demo show "0.7" per epoch
    const count = enrichedEpochs.filter((e) => e.holder && !e.claimed).length;
    if (!count) return '0';
    return (0.7 * count).toFixed(2);
  }, [walletAddr, enrichedEpochs]);

  const handleClaimEpoch = useCallback(
    async (epoch: EpochClaimFile, holder: EpochClaimHolder) => {
      if (!wallet || !walletAddr) {
        tonConnectUi.openModal();
        return;
      }

      try {
        setClaimingEpochId(epoch.epochId);

        const payloadBase64 = buildClaimPayloadBase64(epoch, holder);

        await tonConnectUi.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: epoch.splitter,
              amount: toNano('0.05').toString(), // как в скрипте
              payload: payloadBase64,
            },
          ],
        });
      } catch (e) {
        console.error('claim error', e);
      } finally {
        setClaimingEpochId(null);
      }
    },
    [wallet, walletAddr, tonConnectUi],
  );

  return (
    <UrbanLayout allowScroll={true} title="Urban Dreams">
      <div
        style={{
          padding: '1rem',
          color: colors.text,
          background: colors.bgGradient,
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '7rem auto 4rem',
          }}
        >
          {/* TREASURY OVERVIEW */}
          <section
            style={{
              padding: '2rem',
              borderRadius: '20px',
              background: colors.glassBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.border}`,
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '0.5rem',
                fontSize: '2.2rem',
                fontWeight: 400,
                textAlign: 'center',
              }}
            >
              Treasury
            </h2>
            <p
              style={{
                margin: 0,
                marginBottom: '1.5rem',
                fontSize: '1.rem',
                textAlign: 'center',
                color: "#d8d8d8",
                lineHeight: 1.5,
              }}
            >
              Half of every royalty flows here before being shared with the dreamers.
              This is the quiet engine behind Urban Dreams.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '14px',
                  background: colors.glassInner,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    color: "#d8d8d8",
                    marginBottom: '0.4rem',
                  }}
                >
                  Current Bank
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 500,
                  }}
                >
                  {splitterState ? `${animatedBalance} TON` : '—'}
                </div>
                {/* <div
                  style={{
                    fontSize: '0.75rem',
                    color: "#d8d8d8",
                    marginTop: '0.2rem',
                  }}
                >
                  last 100 tx via testnet.tonapi.io
                </div> */}
              </div>

              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '14px',
                  background: colors.glassInner,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    color: "#d8d8d8",
                    marginBottom: '0.4rem',
                  }}
                >
                  Current Epoch
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 500,
                  }}
                >
                  {currentEpoch?.epoch.epochId ?? '--'}
                </div>
              </div>

              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '14px',
                  background: colors.glassInner,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    color: "#d8d8d8",
                    marginBottom: '0.4rem',
                  }}
                >
                  Total Claimed
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 500,
                  }}
                >
                  {
                  //currentEpoch?.epoch.epochId ?? 
                  '---'}
                  
                </div>
              </div>

              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '14px',
                  background: colors.glassInner,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    color: "#d8d8d8",
                    marginBottom: '0.4rem',
                  }}
                >
                  Next Claim Condition
                </div>
                <div
                  style={{
                    fontSize: '1.05rem'
                  }}
                >
                  Bank &ge; 10&nbsp;TON
                </div>
              </div>
            </div>

            {/* Wallet / Next Epoch Condition */}
            {/* <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '14px',
                background: colors.glassInner,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '1.1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.2rem' }}>
                  Next Epoch Condition:<br/> Treasury Balance &gt; 10&nbsp;TON
                  </div>
                </div>
                <span
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    background: colors.glassBg,
                    border: `1px solid ${colors.border}`,
                    color: colors.muted,
                  }}
                >
                  auto-managed
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem'
                }}
              >
                <span style={{ color: "#d8d8d8" }}>${lp.tgWebAppData?.user?.username}'s Wallet</span>
                {walletShort ? (
                  <span
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '999px',
                      background: colors.glassBg,
                      border: `1px solid ${colors.border}`,
                      fontSize: '1.1rem',
                    }}
                  >
                    {walletShort}
                  </span>
                ) : (
                  <button
                    onClick={() => tonConnectUi.openModal()}
                    style={{
                      borderRadius: '999px',
                      padding: '0.35rem 0.9rem',
                      background: 'transparent',
                      border: `1px solid ${colors.accent}`,
                      color: colors.accent,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                    }}
                  >
                    Connect wallet
                  </button>
                )}
              </div>
            </div> */}
          </section>

          {/* YOUR POSITION */}
          {/* <section
            style={{
              padding: '1.6rem 1.5rem',
              borderRadius: '18px',
              background: colors.glassBg,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(10px)',
              marginBottom: '2rem',
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: '1.2rem',
                fontSize: '1.1rem',
                color: "#d8d8d8",
              }}
            >
              Merkle snapshots decide how much of each epoch belongs to you.
              We only need your address and the proofs baked into the epoch files.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.9rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '12px',
                  background: colors.glassInner,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    color: "#d8d8d8",
                    marginBottom: '0.3rem',
                  }}
                >
                  Claimable (est.)
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                  {wallet ? `${mockClaimable} TON` : '--'}
                </div>
              </div>

              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '12px',
                  background: colors.glassInner,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    color: "#d8d8d8",
                    marginBottom: '0.3rem',
                  }}
                >
                  Epochs with rewards
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                  {wallet
                    ? enrichedEpochs.filter((e) => e.holder && !e.claimed).length
                    : '--'}
                </div>
              </div>
            </div>

            <button
              disabled={!wallet}
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '999px',
                border: 'none',
                background: wallet ? colors.accentSoft : colors.glassInner,
                color: wallet ? '#1a1f2e' : colors.hint,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: wallet ? 'pointer' : 'default',
                marginTop: '0.3rem',
              }}
            >
              {wallet ? 'Claim all (soon™)' : 'Connect wallet to claim'}
            </button>

            <p
              style={{
                margin: 0,
                marginTop: '0.7rem',
                fontSize: '1.1rem',
                color: "#d8d8d8",
                textAlign: 'center',
              }}
            >
              Per-epoch claiming is available below. Batch claim can be added later.
            </p>
          </section> */}

          {/* EPOCH LIST */}
          <section
            style={{
              marginBottom: '3rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '1rem',
                fontWeight: 300,
                textAlign: 'center',
                fontSize: '1.7rem'
              }}
            >
              History
            </h3>

            {loadingEpochs && (
              <p style={{ color: "#d8d8d8", fontSize: '0.95rem' }}>
                Loading epochs…
              </p>
            )}
            {epochsError && (
              <p style={{ color: colors.danger, fontSize: '0.95rem' }}>
                {epochsError}
              </p>
            )}
            {txsError && (
              <p style={{ color: colors.danger, fontSize: '0.95rem' }}>
                Tx error: {txsError}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {enrichedEpochs.map(({ epoch, holder, claimed }) => {
                const isCurrent = currentEpoch?.epoch.epochId === epoch.epochId;

                const labelStatus = claimed
                  ? 'Claimed'
                  : holder
                  ? 'Claimable'
                  : 'View only';

                const labelColor = claimed
                  ? colors.accent
                  : holder
                  ? colors.accentSoft
                  : colors.hint;

                return (
                  <div
                    key={epoch.epochId}
                    style={{
                      padding: '1.1rem 1rem',
                      borderRadius: '16px',
                      background: colors.glassBg,
                      border: `1px solid ${colors.border}`,
                      backdropFilter: 'blur(8px)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isCurrent && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background:
                            'linear-gradient(90deg, transparent, #4CAF50, transparent)',
                          opacity: 0.9,
                        }}
                      />
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            color: "#d8d8d8",
                            marginBottom: '0.2rem',
                          }}
                        >
                          Epoch #{epoch.epochId}
                        </div>
                        <div
                          style={{
                            fontSize: '1rem',
                            marginBottom: '0.3rem',
                          }}
                        >
                          {epoch.label ?? epoch.epoch_file ?? 'Snapshot epoch'}
                        </div>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            color: "#d8d8d8",
                          }}
                        >
                          {new Date(epoch.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '0.4rem',
                        }}
                      >
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            background: colors.glassInner,
                            border: `1px solid ${colors.border}`,
                            color: labelColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {labelStatus}
                        </span>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            color: "#d8d8d8",
                            textAlign: 'right',
                          }}
                        >
                          Holders: {epoch.total}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '0.7rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        fontSize: '0.95rem',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ color: "#d8d8d8" }}>${lp.tgWebAppData?.user?.username}</div>
                        <div>
                          {holder
                            ? `${holder.owner.slice(0, 4)}...${holder.owner.slice(-4)}`
                            : walletAddr
                            ? 'Not in snapshot'
                            : 'Connect wallet'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {holder && !claimed && wallet && (
                          <button
                            onClick={() => handleClaimEpoch(epoch, holder)}
                            disabled={claimingEpochId === epoch.epochId}
                            style={{
                              padding: '0.5rem 0.9rem',
                              borderRadius: '999px',
                              border: 'none',
                              background: colors.accentSoft,
                              color: '#1a1f2e',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {claimingEpochId === epoch.epochId
                              ? 'Claiming…'
                              : 'Claim this epoch'}
                          </button>
                        )}

                        {!holder && wallet && (
                          <button
                            disabled
                            style={{
                              padding: '0.45rem 0.9rem',
                              borderRadius: '999px',
                              border: `1px solid ${colors.border}`,
                              background: 'transparent',
                              color: "#d8d8d8",
                              fontSize: '1.1rem',
                            }}
                          >
                            Not eligible
                          </button>
                        )}

                        {!wallet && (
                          <button
                            onClick={() => tonConnectUi.openModal()}
                            style={{
                              padding: '0.45rem 0.9rem',
                              borderRadius: '999px',
                              border: `1px solid ${colors.accent}`,
                              background: 'transparent',
                              color: colors.accent,
                              fontSize: '1.1rem',
                              cursor: 'pointer',
                            }}
                          >
                            Connect to claim
                          </button>
                        )}

                        {holder && claimed && (
                          <button
                            disabled
                            style={{
                              padding: '0.45rem 0.9rem',
                              borderRadius: '999px',
                              border: `1px solid ${colors.accent}`,
                              background: 'transparent',
                              color: colors.accent,
                              fontSize: '1.1rem',
                            }}
                          >
                            Claimed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {!loadingEpochs && enrichedEpochs.length === 0 && (
                <p style={{ color: "#d8d8d8", fontSize: '1.15rem', textAlign: 'center' }}>
                  No epochs found yet. <br/>Treasury is still gathering its first dream.
                </p>
              )}
            </div>
          </section>

          <div
            style={{
              textAlign: 'center',
              padding: '2rem 1rem 0rem',
              opacity: 0.9,
              fontSize: '1rem',
              fontWeight: 300,
              fontStyle: 'italic',
              color: "#d8d8d8",
            }}
          >
            Treasury is the heartbeat of proejct economics — slow, transparent, and shared.
          </div>
        </div>
      </div>
    </UrbanLayout>
  );
}
