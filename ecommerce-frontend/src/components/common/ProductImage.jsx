import React from 'react';
import ImageWithFallback from './ImageWithFallback';
import { getProductImageUrl } from '../../utils/imageHelper';

/**
 * Product Image component with improved image handling
 * Uses a text placeholder for products without images
 * 
 * @param {Object} props Component props
 * @param {string} props.imageUrl Original image URL or path from the product
 * @param {string} props.productName Product name for alt text and placeholders
 * @param {Object} props.style Custom styles for the image container
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} Rendered component
 */
const ProductImage = ({ 
  imageUrl, 
  productName,
  style = {},
  className = '',
  ...props 
}) => {
  // Get the properly formatted URL directly
  const formattedUrl = getProductImageUrl(imageUrl);
  
  // Pass the calculated URL directly to ImageWithFallback
  return (
    <ImageWithFallback
      src={formattedUrl} // Use the directly calculated URL
      alt={productName || 'Product image'}
      className={className}
      style={style}
      // No fallbackSrc - let ImageWithFallback use the text placeholder
      {...props}
    />
  );
};

export default ProductImage;
