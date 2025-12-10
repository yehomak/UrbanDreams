// src/hooks/useNftsData.ts
import { useEffect, useState } from 'react';
import { fetchIPFSData } from '@/utils/ipfs';
import nftsConfigJson from '@/data/nfts.json';
import { sleep } from '@/utils/debugUtils';

type NftConfig = {
  index: number;
  ipfsHash: string;
  blockchainHash: string;
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

const NFT_CONFIG: NftConfig[] = nftsConfigJson as NftConfig[];

// ---- simple module-level cache ----
let cachedNfts: NftItem[] | null = null;
let inFlight: Promise<NftItem[]> | null = null;

async function loadAllNfts(): Promise<NftItem[]> {
  if (cachedNfts) return cachedNfts;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const results = await Promise.all(
      NFT_CONFIG.map(async (cfg) => {
        const res = await fetchIPFSData(cfg.ipfsHash);
        const metadata = (res?.data || {}) as NftMetadata;

        const imageUrl = metadata.image
          ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
          : '/404.png';

        return {
          index: cfg.index,
          blockchainHash: cfg.blockchainHash,
          ipfsHash: cfg.ipfsHash,
          metadata,
          imageUrl,
        } as NftItem;
      }),
    );

    const sorted = results.slice().sort((a, b) => a.index - b.index);
    cachedNfts = sorted;
    inFlight = null;
    return sorted;
  })();

  return inFlight;
}

export function useNftsData() {
  const [data, setData] = useState<NftItem[] | null>(cachedNfts);
  const [isLoading, setIsLoading] = useState(!cachedNfts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!cachedNfts) {
      setIsLoading(true);
      setError(null);

      loadAllNfts()
        .then((items) => {
          if (cancelled) return;
          setData(items);
        })
        .catch((e) => {
          console.error('Failed to load NFTs', e);
          if (cancelled) return;
          setError('Failed to load NFTs');
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    } else {
      // we already have cache, ensure state is in sync
      setData(cachedNfts);
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { nfts: data ?? [], isLoading, error };
}
