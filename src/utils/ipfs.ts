// src/utils/ipfs.ts
import axios from 'axios';

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  // Add other OpenSea/Rarible standard fields as needed
}

export async function fetchIPFSData<T = NFTMetadata>(cid: string): Promise<T> {
  try {
    const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
    
    const response = await axios.get<T>(gatewayUrl, {
      timeout: 3000,
      headers: { 'Accept': 'application/json' }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching IPFS data:', error);
    throw error;
  }
}