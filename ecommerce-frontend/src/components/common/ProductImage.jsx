import React, { useState } from 'react';
import { getProductImageUrl } from '../../utils/imageHelper';

/**
 * Product Image component with improved image handling
 */
const ProductImage = ({ 
  imageUrl, 
  productName,
  style = {},
  className = '',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const defaultImage = '/images/default-product.png';
  
  // Get formatted URL using the helper
  const formattedUrl = !imageError ? getProductImageUrl(imageUrl) : defaultImage;
  
  // Default placeholder style if no image URL
  const placeholderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    fontSize: '0.875rem',
    ...style
  };

  // If no image URL or previous error, show placeholder
  if (!formattedUrl || imageError) {
    return (
      <div className={`${className} rounded-lg`} style={placeholderStyle}>
        <div className="text-center p-4">
          <span className="material-icons text-4xl mb-2">image</span>
          <p className="text-sm">{productName || 'Product Image'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden`}>
      <img
        src={formattedUrl}
        alt={productName || 'Product image'}
        onError={() => setImageError(true)}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ProductImage;
