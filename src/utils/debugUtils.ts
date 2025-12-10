// src/utils/debugUtils.ts
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Usage in your useMarkers hook:
export function useMarkers(initialPosition: [number, number]) {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug flag - set to true to simulate slow loading
  const DEBUG_SLOW_LOAD = false;
  const DEBUG_DELAY = 3000; // 3 seconds

  const stableInitialPosition = useMemo(() => initialPosition, []);

  const loadMarkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // DEBUG: Simulate slow network
      if (DEBUG_SLOW_LOAD) {
        console.log(`⏱️ Simulating slow load (${DEBUG_DELAY}ms)...`);
        await sleep(DEBUG_DELAY);
      }

      const nftMetadataList = await Promise.all(
        IPFS_HASHES.map(async (ipfsHash, index) => {
          // DEBUG: Add staggered delays to see progressive loading
          if (DEBUG_SLOW_LOAD) {
            await sleep(index * 200); // Stagger each request
          }
          
          try {
            const data = await fetchIPFSData(ipfsHash);
            
            // DEBUG: Simulate some items failing
            if (DEBUG_SLOW_LOAD && Math.random() > 0.8) {
              throw new Error('Simulated network error');
            }
            
            return data;
          } catch (error) {
            console.error(`Error loading NFT ${ipfsHash}:`, error);
            return null;
          }
        })
      );

      // Rest of your loading logic...
      const loadedMarkers = nftMetadataList
        .filter((data, index) => data !== null && index < BLOCKCHAIN_HASHES.length)
        .map((data, index) => {
          // Your existing marker creation logic
          // ...
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