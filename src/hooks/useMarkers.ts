import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchIPFSData } from '@/utils/ipfs';

interface Marker {
  position: [number, number];
  title: string;
  description: string;
  img_src: string;
  emoji: string;
  ipfsHash: string;
  blockchainHash: string;
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

// Hardcoded blockchain hashes for each item
const BLOCKCHAIN_HASHES = [
  'EQCZN61mCieUlpGNXuV0pzn4kCRAfdb7OHDMXV9F2uQ8S9yG',
  'EQALW1a6nePiMEQronZdyMoHdLeMM8wDcByq7m4RsExN7Cxv',
  'EQAVxovB-UhVE5cJ1WjQNP-Oq5ymfnTs9v5Tek2MDqndAITd',
  'EQCSXhsBPntZpDlAxcSL52s-Nt6nYuhnc4KPNx8tuoVH8jT6',
  'EQDb4RT2YhHApiu4nrDI2q3AdzHk72wZBgCZJpwEjJXmh9DP',
  'EQBY8dCL63UUSVTPRCDvwoKEB2iCWdpkETg_9klgxd0RuHte',
  'EQC-3xDCJ-YrmfpmldfTQdPBeZSzcmpmwcyunaJEx0zv5dus',
  'EQBPtp416ga-yfsAK8D8ij_WRUhG3tf-m0Dq7ol1Mw9oIhYC',
  'EQB45MQqwt9TTibUf6Cr0mB-8vDe4yCPMTtCj0oVyDSpr3KV',
  'EQAPkuRFlfsnY-sPEWewDZhPJEM-uZhbNpx_TtaUZjc6XLIH',
  'EQDLQEaRtpg-g4RWgwGDQZvGmfkdnRJV2wM4_4HD48slFaUG',
];

// IPFS hashes to load metadata from
const IPFS_HASHES = [
  'bafkreigiyw3vu6vthobogfrxsqa6cr4uy32dkhc76qsnq67bwmwvblhleu',
  'bafkreihgfmkb7uw7wzyozwx4irignpws5krrc767fabjs4tz77xrc52o5e',
  'bafkreib5xxft6rpk6ztyy5tshyf6qm7psi3ljbctp6vjkrrxbs5l4wrg2u',
  'bafkreicjtvcasbacujjsbw2u6s74z5w4w5ghpaj4kxeh5fyfkqymm627cm',
  'bafkreif6pssl5rqilqx2lkny6i7htodxqa4fm4cjuji745aqkdqgsonvua',
  'bafkreia37k7qqofnkwvjbua4ioh375fbwgqsl7oi7k5ovsdpg3oeku4ham',
  'bafkreidqw7aoiwwozygzjuskqmia45qx7ue7xg4fbjvka3lsr562xkooge',
  'bafkreifcyh6j7jus4psclgrpb6n76vwbsnvo6sx6pift2z6onkc7hpwhna',
  'bafkreiekg2tutl5k4mfou5nurrpbgtdf4spopcbcjhijzgndfdhu3e4rnq',
  'bafkreibwgozdcn3votkppchztai4imtml6kdenwzo2qsqqhxxczxmcbwlq',
  'bafkreignmw4ftkhv77iiqkwtecwjjyqv64lilozelbibnkxemwxsiis7aq',
];

const EMOJIS = ["🌳", "🏗️", "🚉", "🪑", "🏙️", "🎲", "🪞", "🪴", "👁️⃤", "💮", "🦚"];

// src/hooks/useMarkers.ts
export function useMarkers(initialPosition: [number, number]) {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stableInitialPosition = useMemo(() => initialPosition, []);

  const loadMarkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nftMetadataList = await Promise.all(
        IPFS_HASHES.map((ipfsHash, index) => 
          fetchIPFSData(ipfsHash).catch(error => {
            console.error(`Error loading NFT ${ipfsHash}:`, error);
            return null;
          })
        )
      );

      const loadedMarkers = nftMetadataList
        .filter((data, index) => data !== null && index < BLOCKCHAIN_HASHES.length)
        .map((data, index) => {
          const metadata = data!.data;
          const ipfsHash = IPFS_HASHES[index];
          const blockchainHash = BLOCKCHAIN_HASHES[index];

          // Extract coordinates from metadata attributes
          const locationAttr = metadata.attributes?.find((a: any) => 
            a.trait_type === "Coordinates" || a.trait_type === "Location"
          );
          
          const [lat, lng] = locationAttr?.value
            ? String(locationAttr.value).split(",").map(Number)
            : [
                stableInitialPosition[0] + (Math.random() - 0.5) * 0.01,
                stableInitialPosition[1] + (Math.random() - 0.5) * 0.01
              ];

          const emoji = EMOJIS[index % EMOJIS.length];

          // Convert IPFS image URL if needed
          const imageSrc = metadata.image
            ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            : "/404.png";

          return {
            position: [lat, lng] as [number, number],
            title: metadata.name || `Urban Dream #${index + 1}`,
            description: metadata.description || "No description available",
            img_src: imageSrc,
            emoji,
            ipfsHash,
            blockchainHash,
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
  }, [stableInitialPosition]);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  return { markers, isLoading, error, reload: loadMarkers };
}