// src/hooks/useMarkers.ts
import { useMemo } from 'react';
import { useNftsData } from '@/hooks/useNftsData';
import { sleep } from '@/utils/debugUtils';

const EMOJIS = ['🌳', '🏗️', '🚉', '🪑', '🏙️', '🎲', '🪞', '🪴', '👁️⃤', '💮', '🦚'];

export interface Marker {
  position: [number, number];
  title: string;
  description: string;
  img_src: string;
  emoji: string;
  ipfsHash: string;
  blockchainHash: string;
  nftMetadata: any;
}

export function useMarkers(initialPosition: [number, number]) {
  const { nfts, isLoading, error } = useNftsData();

  const markers = useMemo<Marker[]>(() => {
    if (!nfts.length) return [];

    return nfts.map((nft, index) => {
      const metadata = nft.metadata;

      const locationAttr = metadata.attributes?.find(
        (a: any) =>
          a.trait_type === 'Coordinates' || a.trait_type === 'Location',
      );

      const [lat, lng] = locationAttr?.value
        ? String(locationAttr.value)
            .split(',')
            .map((v) => Number(v.trim()))
        : [
            initialPosition[0] + (Math.random() - 0.5) * 0.01,
            initialPosition[1] + (Math.random() - 0.5) * 0.01,
          ];

      const emoji = EMOJIS[index % EMOJIS.length];

      return {
        position: [lat, lng] as [number, number],
        title: metadata.name || `Urban Dream #${nft.index}`,
        description: metadata.description || '',
        img_src: nft.imageUrl,
        emoji,
        ipfsHash: nft.ipfsHash,
        blockchainHash: nft.blockchainHash,
        nftMetadata: metadata,
      };
    });
  }, [nfts, initialPosition]);

  // optional reload stub (you can add a real invalidation later if needed)
  const reload = () => {
    // if someday you want a "force refresh", you can reset cachedNfts here
  };

  return { markers, isLoading, error, reload };
}