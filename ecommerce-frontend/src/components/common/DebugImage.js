// A debug component to help troubleshoot image loading issues
import React, { useState, useEffect } from 'react';
import { getProductImageUrl } from '../../utils/imageHelper';

/**
 * A component for debugging image URLs and loading issues
 * This will display the raw URL, processed URL, and loading status
 */
const DebugImage = ({ imageUrl, width = 100, height = 100 }) => {
  const [processedUrl, setProcessedUrl] = useState('');
  const [loadStatus, setLoadStatus] = useState('loading');
  
  useEffect(() => {
    try {
      const url = getProductImageUrl(imageUrl);
      setProcessedUrl(url);
    } catch (err) {
      console.error('Error processing URL in DebugImage:', err);
      setProcessedUrl('Error processing URL');
    }
  }, [imageUrl]);
  
  const handleLoad = () => {
    setLoadStatus('loaded');
  };
  
  const handleError = () => {
    setLoadStatus('error');
  };
  
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '10px', 
      margin: '10px 0', 
      borderRadius: '4px',
      backgroundColor: loadStatus === 'error' ? '#ffeeee' : 
                      loadStatus === 'loaded' ? '#eeffee' : '#ffffee'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <strong>Original URL:</strong> <code>{imageUrl || 'undefined'}</code>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Processed URL:</strong> <code>{processedUrl || 'undefined'}</code>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> <span>{loadStatus}</span>
      </div>
      {processedUrl && (
        <img 
          src={processedUrl} 
          onLoad={handleLoad} 
          onError={handleError} 
          alt="Debug" 
          style={{ width, height, objectFit: 'cover' }} 
        />
      )}
    </div>
  );
};

export default DebugImage;
