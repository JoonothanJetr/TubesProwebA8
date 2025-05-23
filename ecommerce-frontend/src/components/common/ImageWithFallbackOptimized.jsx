// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\components\common\ImageWithFallbackOptimized.js
import React, { useState, useEffect, memo, useRef } from 'react';

const ImageWithFallbackOptimized = memo(({
  src,
  alt,
  fallbackSrc,
  style = {},
  className = '',
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

    // Create a new image to test loading
    const img = new Image();
    img.src = src;

    // Handle cached images and immediate loads
    if (img.complete) {
      setIsLoading(false);
      setHasError(false);
    } else {
      img.onload = () => {
        if (imgRef.current) {
          setIsLoading(false);
          setHasError(false);
        }
      };
      img.onerror = () => {
        if (imgRef.current) {
          setHasError(true);
          setIsLoading(false);
        }
      };
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Handle error and load events
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Improved error logging with more context
    console.error(`Image failed to load: 
      - URL: ${src || 'undefined'} 
      - Alt text: ${alt || 'none'}
      - Time: ${new Date().toISOString()}`);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if ((hasError || !src || src === 'undefined' || src === 'null') && !fallbackSrc) {
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

  return (
    <div 
      className={`image-container position-relative ${className}`}
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
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <img
        ref={imgRef}
        src={hasError && fallbackSrc ? fallbackSrc : src}
        alt={alt || 'Image'}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out',
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
});

// Add display name for React DevTools
ImageWithFallbackOptimized.displayName = 'ImageWithFallbackOptimized';

export default ImageWithFallbackOptimized;
