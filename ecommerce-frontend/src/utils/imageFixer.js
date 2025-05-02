/**
 * This file contains utilities to help fix image path issues across the application
 * It applies consistent path normalization to all image sources
 */

import { getProductImageUrl } from './imageHelper';

/**
 * Fix common image path issues that might be encountered in responses from the backend
 * 
 * @param {Object} items - Array of objects containing image_url properties
 * @returns {Object} Same array with fixed image URLs
 */
export const normalizeImagePaths = (items) => {
  if (!Array.isArray(items)) {
    console.warn('normalizeImagePaths expected an array, received:', typeof items);
    return items;
  }
  
  return items.map(item => {
    if (!item) return item;
    
    // Create a new object to avoid mutating the original
    const fixedItem = { ...item };
    
    if (fixedItem.image_url) {
      // Use our standard helper to normalize the path
      fixedItem.image_url = getProductImageUrl(fixedItem.image_url);
    }
    
    return fixedItem;
  });
};

/**
 * Fix a single item's image path
 * 
 * @param {Object} item - Object containing image_url property
 * @returns {Object} Same object with fixed image URL
 */
export const normalizeItemImagePath = (item) => {
  if (!item) return item;
  
  // Create a new object to avoid mutating the original
  const fixedItem = { ...item };
  
  if (fixedItem.image_url) {
    // Use our standard helper to normalize the path
    fixedItem.image_url = getProductImageUrl(fixedItem.image_url);
  }
  
  return fixedItem;
};
