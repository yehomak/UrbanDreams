// src/components/GoogleMapsButton.tsx
import React, { useState } from 'react';

interface GoogleMapsButtonProps {
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const GoogleMapsButton: React.FC<GoogleMapsButtonProps> = ({
  latitude,
  longitude,
  title = "Location",
  address,
  className = "",
  variant = 'secondary',
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  // Generate Google Maps URLs for different platforms
  const generateMapsUrls = () => {
    const baseUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    // Deep link for mobile apps
    const mobileDeepLink = `comgooglemaps://?q=${latitude},${longitude}&center=${latitude},${longitude}&zoom=15`;
    const appleMaps = `http://maps.apple.com/?q=${latitude},${longitude}&z=15`;
    
    return {
      web: baseUrl,
      search: searchUrl,
      directions: directionsUrl,
      mobile: mobileDeepLink,
      apple: appleMaps
    };
  };

  const handleOpenMaps = async () => {
    try {
      setIsLoading(true);
      
      const urls = generateMapsUrls();
      let targetUrl = urls.web;

      // Detect platform and choose appropriate URL
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        targetUrl = urls.apple;
      } else if (/Android/.test(navigator.userAgent)) {
        // Try to open Google Maps app first, fallback to web
        window.location.href = urls.mobile;
        setTimeout(() => {
          if (document.hidden) {
            // App opened successfully
            onSuccess?.(urls.mobile);
          } else {
            // Fallback to web
            window.open(urls.web, '_blank', 'noopener,noreferrer');
            onSuccess?.(urls.web);
          }
        }, 500);
        return;
      }

      // Open in new tab for web
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      
      setHasOpened(true);
      onSuccess?.(targetUrl);
      
      // Reset opened state after 3 seconds
      setTimeout(() => setHasOpened(false), 3000);
      
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to open Google Maps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = () => {
    const urls = generateMapsUrls();
    window.open(urls.directions, '_blank', 'noopener,noreferrer');
  };

  const getButtonText = () => {
    if (isLoading) return 'Opening...';
    if (hasOpened) return '✅ Opened!';
    return '📍 View on Map';
  };

  const isDisabled = isLoading;

  if (variant === 'primary') {
    return (
      <button
        className={`google-maps-primary-btn ${className}`}
        onClick={handleOpenMaps}
        disabled={isDisabled}
        title={`Open ${title} in Google Maps`}
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <span className="maps-icon">📍</span>
        )}
        {getButtonText()}
      </button>
    );
  }

  return (
    <button
      className={`google-maps-secondary-btn ${className}`}
      onClick={handleOpenMaps}
      disabled={isDisabled}
      title={`Open ${title} in Google Maps`}
    >
      {isLoading ? (
        <div className="spinner-small"></div>
      ) : (
        <span className="maps-icon-small">📍</span>
      )}
      {getButtonText()}
    </button>
  );
};

// Additional component for directions
export const GoogleMapsDirectionsButton: React.FC<GoogleMapsButtonProps> = (props) => {
  const handleOpenDirections = () => {
    const urls = props.generateMapsUrls?.() || generateMapsUrls(props.latitude, props.longitude);
    window.open(urls.directions, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      className="google-maps-directions-btn"
      onClick={handleOpenDirections}
      title="Get directions to this location"
    >
      <span className="directions-icon">🧭</span>
      Get Directions
    </button>
  );
};

// Helper function to generate URLs (for standalone use)
export const generateMapsUrls = (lat: number, lng: number) => {
  return {
    web: `https://www.google.com/maps?q=${lat},${lng}`,
    search: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    mobile: `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=15`,
    apple: `http://maps.apple.com/?q=${lat},${lng}&z=15`
  };
};