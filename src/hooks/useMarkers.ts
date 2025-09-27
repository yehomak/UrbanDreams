import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchIPFSData } from '@/utils/ipfs';

interface Marker {
  position: [number, number];
  title: string;
  description: string;
  img_src: string;
  nftMetadata?: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | boolean | number;
    }>;
  };
}

// src/hooks/useMarkers.ts
export function useMarkers(initialPosition: [number, number]) {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize initial position to prevent recreation
  const stableInitialPosition = useMemo(() => initialPosition, []);

  const nftUris = useMemo(() => [
    'QmXiyYEVEk9bipN3VtLREkHmMkEAnnGptiieH1UHAm6MZQ',
    'bafybeicoko77fbnn5s5ooeuetpono3slwwvqin2arl6gawbhtkiezoys5q/nfts/1/meta.json'
  ], []);

  const loadMarkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nftMetadataList = await Promise.all(
        nftUris.map(uri => 
          fetchIPFSData(uri).catch(error => {
            console.error(`Error loading NFT ${uri}:`, error);
            return null;
          })
      ));

      const loadedMarkers = nftMetadataList
        .filter(Boolean)
        .map(metadata => {
          const locationAttr = metadata.attributes.find(attr => attr.trait_type === 'Location');
          const [lat, lng] = locationAttr?.value 
            ? String(locationAttr.value).split(',').map(Number)
            : stableInitialPosition; // Use stable position
          return {
            position: [lat, lng],
            title: metadata.name || 'Untitled NFT',
            description: metadata.description || "The windows had gone dark months ago, but the building still held its breath. The silence is louder than collapse. \nThe windows had gone dark months ago, but the building still held its breath. The silence is louder than collapse.",
            img_src: metadata.image 
              ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
              : 'https://i1.sndcdn.com/artworks-PC0vxgr8ydeSsQPa-UeUfQg-t500x500.jpg',
            nftMetadata: metadata
          };
        });

      setMarkers(loadedMarkers);
    } catch (error) {
      console.error('Error loading markers:', error);
      setError('Failed to load map data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [nftUris, stableInitialPosition]); // Only depends on stable values

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  return { markers, isLoading, error, reload: loadMarkers };
}