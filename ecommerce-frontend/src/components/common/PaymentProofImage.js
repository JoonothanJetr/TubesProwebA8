import React from 'react';
import ImageWithFallback from './ImageWithFallback';
import { getPaymentProofUrl } from '../../utils/imageHelper';

/**
 * Payment Proof Image component with improved image handling
 * Uses a text placeholder for missing payment proofs
 * 
 * @param {Object} props Component props
 * @param {string} props.imageUrl Original image URL or path
 * @param {string} props.orderNumber Order number for alt text and placeholders
 * @param {Object} props.style Custom styles for the image container
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} Rendered component
 */
const PaymentProofImage = ({ 
  imageUrl, 
  orderNumber,
  style = {},
  className = '',
  ...props 
}) => {
  // Get the properly formatted URL directly
  const formattedUrl = getPaymentProofUrl(imageUrl);
  
  return (
    <ImageWithFallback
      src={formattedUrl}
      alt={`Bukti Bayar Order #${orderNumber || 'Unknown'}`}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default PaymentProofImage;