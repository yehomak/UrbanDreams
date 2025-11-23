// src/components/GetGemsButton.tsx
import React, { useState } from 'react';
import { COLLECTION, CollectionUtils } from '../constants/collection';

interface GetGemsButtonProps {
  blockchainHash: string;
  nftName?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const GetGemsButton: React.FC<GetGemsButtonProps> = ({
  blockchainHash,
  nftName = "NFT",
  className = "",
  variant = 'primary',
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const getgemsUrl = CollectionUtils.generateGetGemsUrl(COLLECTION.URBAN_DREAMS.address, blockchainHash);

  const handleOpenGetGems = async () => {
    try {
      setIsLoading(true);
      
      if (!getgemsUrl) {
        throw new Error('Could not generate GetGems URL');
      }

      // Open GetGems in new tab or Telegram WebApp
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(getgemsUrl);
        window.Telegram.WebApp.showAlert(`Opening ${nftName} on GetGems...`);
      } else {
        window.open(getgemsUrl, '_blank', 'noopener,noreferrer');
      }

      setHasOpened(true);
      onSuccess?.(getgemsUrl);
      
      // Reset opened state after 3 seconds
      setTimeout(() => setHasOpened(false), 3000);
      
    } catch (error) {
      console.error('Error opening GetGems:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to open GetGems');
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Error opening GetGems. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Opening...';
    if (hasOpened) return '✅ Opened!';
    if (blockchainHash) return 'View on GetGems';
    return 'View Collection';
  };

  const isDisabled = isLoading;

  if (variant === 'secondary') {
    return (
      <button
        className={`getgems-secondary-btn ${className}`}
        onClick={handleOpenGetGems}
        disabled={isDisabled}
        title={getgemsUrl}
      >
        {isLoading ? (
          <div className="spinner-small"></div>
        ) : (
          <span className="gem-icon-small">💎</span>
        )}
        {getButtonText()}
      </button>
    );
  }

  return (
    <button
      className={`getgems-primary-btn ${className}`}
      onClick={handleOpenGetGems}
      disabled={isDisabled}
    >
      {isLoading ? (
        <>
          <div className="spinner"></div>
          Opening...
        </>
      ) : (
        <>
          <span className="gem-icon">💎</span>
          {getButtonText()}
          <span className="external-icon">↗</span>
        </>
      )}
    </button>
  );
};