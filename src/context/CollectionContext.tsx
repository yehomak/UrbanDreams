// src/contexts/CollectionContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { COLLECTIONS, CollectionUtils } from '../constants/collection';

interface CollectionContextType {
  currentCollection: typeof COLLECTIONS.URBAN_DREAMS;
  collectionLinks: ReturnType<typeof CollectionUtils.generateLinks>;
  utils: typeof CollectionUtils;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: CollectionContextType = {
    currentCollection: COLLECTIONS.URBAN_DREAMS,
    collectionLinks: CollectionUtils.generateLinks(COLLECTIONS.URBAN_DREAMS.address),
    utils: CollectionUtils
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};