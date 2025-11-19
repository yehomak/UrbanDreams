import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchIPFSData } from '@/utils/ipfs';

interface Marker {
  position: [number, number];
  title: string;
  description: string;
  img_src: string;
  emoji: string;
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

  const stableInitialPosition = useMemo(() => initialPosition, []);

  const nftUris = useMemo(() => [
    'bafkreigiyw3vu6vthobogfrxsqa6cr4uy32dkhc76qsnq67bwmwvblhleu',
    'bafkreihgfmkb7uw7wzyozwx4irignpws5krrc767fabjs4tz77xrc52o5e',
    'bafkreib5xxft6rpk6ztyy5tshyf6qm7psi3ljbctp6vjkrrxbs5l4wrg2u',
    'bafkreicjtvcasbacujjsbw2u6s74z5w4w5ghpaj4kxeh5fyfkqymm627cm',
    'bafkreif6pssl5rqilqx2lkny6i7htodxqa4fm4cjuji745aqkdqgsonvua',
    'bafkreia37k7qqofnkwvjbua4ioh375fbwgqsl7oi7k5ovsdpg3oeku4ham',
    'bafkreidqw7aoiwwozygzjuskqmia45qx7ue7xg4fbjvka3lsr562xkooge',
    'bafkreifcyh6j7jus4psclgrpb6n76vwbsnvo6sx6pift2z6onkc7hpwhna',
    'bafkreiekg2tutl5k4mfou5nurrpbgtdf4spopcbcjhijzgndfdhu3e4rnq',
    'bafkreibwgozdcn3votkppchztai4imtml6kdenwzo2qsqqhxxczxmcbwlq'
  ], []);

  const EMOJIS = ["🌳", "🏗️","🚉","🪑", "🏙️", "🎲", "🪞",
    "📍", "📍","📍","📍","📍","📍","📍","📍","📍","📍","📍"
  ];

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
        .map((metadata, i) => {
          const locationAttr = metadata.attributes?.find((a: any) => a.trait_type === "Coordinates");
          const [lat, lng] = locationAttr?.value
            ? String(locationAttr.value).split(",").map(Number)
            : stableInitialPosition;

          const emoji = EMOJIS[i % EMOJIS.length]; // 👈 choose by index

          return {
            position: [lat, lng] as [number, number],
            title: metadata.name || "NOT FOUND",
            description: metadata.description || "",
            img_src: metadata.image
              ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : "https://i1.sndcdn.com/artworks-PC0vxgr8ydeSsQPa-UeUfQg-t500x500.jpg",
            nftMetadata: metadata,
            emoji, // 👈 attach
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