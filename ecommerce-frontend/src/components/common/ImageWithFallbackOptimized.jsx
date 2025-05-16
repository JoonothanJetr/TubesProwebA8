// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\components\common\ImageWithFallbackOptimized.js
import React, { useState, useEffect, memo, useRef } from 'react';
import { Image as BootstrapImage, Spinner } from 'react-bootstrap';

/**
 * Optimized image component with placeholder that prevents layout shifts
 * Uses local state to track loading and errors
 * Memoized for better performance
 */
const ImageWithFallbackOptimized = memo(({
  src,
  alt,
  fallbackSrc,
  style,
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  
  // Reset state when src changes
  useEffect(() => {
    // Special handling for empty/invalid src
    if (!src || src === '' || src === 'undefined' || src === 'null') {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    // Reset states for new image loading
    setIsLoading(true);
    setHasError(false);
    
    // For cached images that load instantly
    if (imgRef.current?.complete) {
      setIsLoading(false);
    }
  }, [src]);
  // Handle error and load events
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Improved error logging with more context
    console.error(`Image failed to load: 
      - URL: ${src || 'undefined'} 
      - Alt text: ${alt || 'none'}
      - Component: ImageWithFallbackOptimized
      - Time: ${new Date().toISOString()}`);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Text placeholder component for missing images
  if ((hasError || !src) && !fallbackSrc) {
    const displayText = alt && alt !== 'Product image' ? alt : 'Produk';
    
    return (
      <div 
        className={`text-placeholder d-flex justify-content-center align-items-center text-center ${className}`}
        style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '0.25rem',
          color: '#6c757d',
          padding: '0.5rem',
          width: '100%',
          height: '100%',
          minHeight: '64px',
          minWidth: '64px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <div>
          <i className="bi bi-image text-muted mb-1" style={{ fontSize: '1.25rem', display: 'block' }}></i>
          <span style={{ fontSize: '0.7rem', fontWeight: '500', maxWidth: '100%', wordBreak: 'break-word' }}>
            {displayText.length > 20 ? `${displayText.substring(0, 20)}...` : displayText}
          </span>
        </div>
      </div>
    );
  }

  // Container with fixed dimensions to prevent layout shift
  return (
    <div 
      className="image-container position-relative" 
      style={{ 
        overflow: 'hidden',
        minHeight: '64px',
        minWidth: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style 
      }}
    >
      {/* Loading spinner - only show if still loading */}
      {isLoading && !hasError && (
        <div
          className="position-absolute d-flex justify-content-center align-items-center"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(248, 249, 250, 0.5)',
            zIndex: 1
          }}
        >
          <Spinner animation="border" size="sm" variant="secondary" />
        </div>
      )}

      {/* The actual image */}
      <BootstrapImage
        ref={imgRef}
        src={hasError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={className}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out',
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        loading="lazy" // Add native lazy loading
        {...props}
      />
    </div>
  );
});

// Add display name for React DevTools
ImageWithFallbackOptimized.displayName = 'ImageWithFallbackOptimized';

export default ImageWithFallbackOptimized;
