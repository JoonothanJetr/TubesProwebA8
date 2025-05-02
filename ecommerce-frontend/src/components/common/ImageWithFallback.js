import React, { useState, useEffect } from 'react';
import { Image as BootstrapImage, Spinner } from 'react-bootstrap';

/**
 * Komponen image dengan placeholder yang stabil untuk mencegah tata letak bergetar
 */
const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc,
  style,
  className,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Reset status saat src berubah
  useEffect(() => {
    // Tindakan khusus untuk sumber gambar kosong
    if (!src || src === '') {
      setIsLoading(false);
      setHasError(true);
      setCurrentSrc(null);
      return;
    }
    
    // Jika src berubah dan tidak sama dengan currentSrc
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, currentSrc]);

  // Handler untuk error loading gambar
  const handleError = () => {
    if (!hasError) {
      // Catat error dan langsung beralih ke placeholder
      console.log(`Gagal memuat gambar: ${src || 'undefined'} (Alt: ${alt})`);
      setHasError(true);
      setIsLoading(false);
      setCurrentSrc(null);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Tampilkan placeholder text jika gambar error/kosong dan tidak ada fallbackSrc
  if ((hasError || !currentSrc) && !fallbackSrc) {
    const productName = alt && alt !== 'Product image' ? alt : 'Produk';
    
    return (
      <div 
        className={`d-flex justify-content-center align-items-center text-center ${className}`}
        style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '0.25rem',
          color: '#6c757d',
          padding: '0.5rem',
          width: '100%',
          height: '100%',
          minHeight: '64px', // Minimumkan ke 64px untuk konsistensi
          minWidth: '64px',  // Minimumkan ke 64px untuk konsistensi
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
            {productName.length > 20 ? `${productName.substring(0, 20)}...` : productName}
          </span>
        </div>
      </div>
    );
  }

  // Wrapper dengan dimensi tetap untuk mencegah layout shift
  return (
    <div 
      className="position-relative" 
      style={{ 
        overflow: 'hidden',
        minHeight: '64px', // Minimumkan ke 64px untuk konsistensi
        minWidth: '64px',  // Minimumkan ke 64px untuk konsistensi
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style 
      }}
    >
      {/* Loading spinner */}
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

      {/* Gambar sebenarnya */}
      <BootstrapImage
        src={hasError && fallbackSrc ? fallbackSrc : currentSrc}
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
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
