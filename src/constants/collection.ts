// src/constants/collections.ts
export const COLLECTION = {
    URBAN_DREAMS: {
      address: 'EQBBCUwYDyseMed8SmZMIqE4sC_plx-T5rn2flLfAMqW_z88' as const,
      name: 'Urban Dreams: Warsaw Edition',
      slug: 'urban-dreams',
      description: 'Digital art collection on TON blockchain',
      getgemsBase: 'https://getgems.io/collection'
    }
  } as const;
  
  export const CollectionUtils = {
  
    // Generate GetGems URL for specific item
    generateGetGemsUrl(collectionAddress: string, itemHash: string): string {
      if (!itemHash) {
        // Fallback to collection page if no item hash found
        return `${COLLECTION.URBAN_DREAMS.getgemsBase}/${collectionAddress}`;
      }
      
      return `${COLLECTION.URBAN_DREAMS.getgemsBase}/${collectionAddress}/${itemHash}`;
    },
  
    // Validate TON address
    isValidTONAddress(address: string): boolean {
      return /^EQB[a-zA-Z0-9_-]{48}$/.test(address);
    }
  };



// https://getgems.io/collection/EQBBCUwYDyseMed8SmZMIqE4sC_plx-T5rn2flLfAMqW_z88/bafkreiekg2tutl5k4mfou5nurrpbgtdf4spopcbcjhijzgndfdhu3e4rnq

// https://getgems.io/collection/EQBBCUwYDyseMed8SmZMIqE4sC_plx-T5rn2flLfAMqW_z88/EQB45MQqwt9TTibUf6Cr0mB-8vDe4yCPMTtCj0oVyDSpr3KV

