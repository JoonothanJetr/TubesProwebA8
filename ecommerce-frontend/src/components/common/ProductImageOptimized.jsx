// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\components\common\ProductImageOptimized.js
import React, { useMemo, memo } from 'react';
import ImageWithFallbackOptimized from './ImageWithFallbackOptimized';
import { getProductImageUrl } from '../../utils/imageHelper';

/**
 * Optimized Product Image component
 * Uses memoization to prevent unnecessary re-renders
 * 
 * @param {Object} props Component props
 * @param {string} props.imageUrl Original image URL or path from the product
 * @param {string} props.productName Product name for alt text and placeholders
 * @param {Object} props.style Custom styles for the image container
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} Rendered component
 */
const ProductImageOptimized = memo(({ 
  imageUrl, 
  productName,
  style = {},
  className = '',
  ...props 
}) => {
  // Use useMemo to prevent redundant URL calculations on re-renders
  const formattedUrl = useMemo(() => {
    console.log('Original imageUrl:', imageUrl);
    const url = getProductImageUrl(imageUrl);
    console.log('Formatted imageUrl:', url);
    return url;
  }, [imageUrl]);
  
  // Return memoized component with calculated URL
  return (
    <ImageWithFallbackOptimized
      src={formattedUrl}
      alt={productName || 'Product image'}
      className={className}
      style={style}
      {...props}
    />
  );
});

// Add display name for React DevTools
ProductImageOptimized.displayName = 'ProductImageOptimized';

export default ProductImageOptimized;
