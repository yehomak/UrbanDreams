// src/types/epochs.ts
export type EpochClaimHolder = {
    index: number;
    owner: string;   // friendly address EQ...
    nft: string;
    proof: string[]; // ["0x....", ...]
  };
  
  export type EpochClaimFile = {
    epochId: number;
    epoch_file?: string;
    createdAt: string;
    collectionRaw: string;
    collectionFriendly: string;
    splitter: string; // friendly address
    total: number;
    holders: EpochClaimHolder[];
  };
  