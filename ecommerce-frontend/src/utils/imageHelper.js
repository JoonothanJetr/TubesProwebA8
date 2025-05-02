/**
 * Helper functions for handling image URLs across the app
 */

// For images we use a hardcoded base URL for simplicity
// This avoids issues with undefined environment variables
const API_BASE_URL = 'http://localhost:5000/api';
const API_IMAGE_URL = 'http://localhost:5000';

// Log the actual base URL being used for debugging
console.log('API Image base URL:', API_IMAGE_URL);

// Cache for image existence checks to avoid repeated API calls
const imageExistsCache = {};

/**
 * Get proper image URL whether it's a full URL or a relative path
 * @param {string} imageUrl - The original image URL or path
 * @param {string} placeholder - URL for placeholder image if none exists
 * @returns {string} The formatted image URL
 */
export const getImageUrl = (imageUrl, placeholder = 'https://via.placeholder.com/300x200?text=No+Image') => {
  if (!imageUrl) {
    return placeholder;
  }

  // If it's already a full URL (starts with http/https), use it as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Make sure there's no double slash when joining URL parts
  // First, remove any leading slashes from the imageUrl
  const cleanImagePath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
  
  // Now join with the base URL, ensuring no double slashes
  return `${API_IMAGE_URL}/${cleanImagePath}`;
};

/**
 * Format category image URL 
 * @param {string} categoryImage - Category image path
 * @returns {string} Formatted category image URL
 */
export const getCategoryImageUrl = (categoryImage) => {
  return getImageUrl(
    categoryImage, 
    'https://via.placeholder.com/300x200?text=Category'
  );
};

// URL cache for product images to avoid repeated processing
const productImageUrlCache = {};

/**
 * Format product image URL with caching for better performance
 * @param {string} productImage - Product image path
 * @returns {string|null} Formatted product image URL or null if no image
 */
export const getProductImageUrl = (productImage) => {
  // Return null for null, undefined, empty image - will trigger text placeholder
  if (!productImage || productImage === '' || productImage === 'undefined' || productImage === 'null') {
    return null;
  }
  
  // Use cached URL if available to avoid repeated string operations
  if (productImageUrlCache[productImage]) {
    return productImageUrlCache[productImage];
  }
  
  try {
    let result;
    console.log('Processing image URL:', productImage); // Debug logging
    
    // If it's already a full URL (starts with http/https), use it as is
    if (productImage && typeof productImage === 'string' && productImage.startsWith('http')) {
      result = productImage;
    }
    // Handle paths that start with /images/ (seed data)
    else if (productImage && typeof productImage === 'string' && productImage.startsWith('/images/')) {
      // Remove leading slash if present
      const cleanPath = productImage.startsWith('/') ? productImage.substring(1) : productImage;
      result = `${API_IMAGE_URL}/${cleanPath}`;
    }
    // Handle paths that direct start with /products/ (avoiding double products/ in path)
    else if (productImage && typeof productImage === 'string' && productImage.match(/^\/?products\//)) {
      // Remove leading slash if present
      const cleanPath = productImage.startsWith('/') ? productImage.substring(1) : productImage;
      result = `${API_IMAGE_URL}/uploads/${cleanPath}`;
    }
    // For uploaded images
    else {
      // Remove leading slash if present
      let cleanPath = productImage && typeof productImage === 'string' && productImage.startsWith('/') ? 
        productImage.substring(1) : productImage;
      
      // Fix duplicate paths like 'uploads/products/products/'
      if (cleanPath && typeof cleanPath === 'string' && cleanPath.includes('products/products/')) {
        cleanPath = cleanPath.replace('products/products/', 'products/');
      }
        // If the path already includes 'uploads/', don't add it again
      if (cleanPath && typeof cleanPath === 'string' && cleanPath.includes('uploads/')) {
        result = `${API_IMAGE_URL}/${cleanPath}`;
      } else {
        // Default: assume this is a filename in uploads/products/
        result = `${API_IMAGE_URL}/uploads/products/${cleanPath}`;
      }
    }
      console.log('Generated image URL:', result); // Debug the final URL
    
    // Cache the result to avoid processing it again
    productImageUrlCache[productImage] = result;
    return result;
  } catch (error) {
    console.error('Error processing image URL:', error, 'Original URL:', productImage);
    // Return a placeholder image on error
    return 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
  }
};

/**
 * Format payment proof image URL
 * @param {string} proofImage - Payment proof image path
 * @returns {string} Formatted payment proof image URL
 */
export const getPaymentProofUrl = (proofImage) => {
  return getImageUrl(
    proofImage, 
    'https://via.placeholder.com/300x200?text=No+Proof+Image'
  );
};

/**
 * Format user avatar image URL
 * @param {string} avatarImage - User avatar image path
 * @returns {string} Formatted user avatar image URL
 */
export const getUserAvatarUrl = (avatarImage) => {
  return getImageUrl(
    avatarImage, 
    'https://via.placeholder.com/100x100?text=User'
  );
};

/**
 * Check if an image exists on the server
 * @param {string} imagePath - Path of the image to check
 * @returns {Promise<boolean>} Promise resolving to true if image exists
 */
export const checkImageExists = async (imagePath) => {
  // Return from cache if available
  if (imageExistsCache[imagePath] !== undefined) {
    return imageExistsCache[imagePath];
  }

  try {
    // Extract filename from path
    const filename = imagePath.split('/').pop();
    
    // Call the API to check if image exists
    const response = await fetch(`${API_BASE_URL}/products/check-image/${filename}`);
    const data = await response.json();
    
    // Cache the result
    imageExistsCache[imagePath] = data.exists;
    
    return data.exists;
  } catch (error) {
    console.error('Error checking if image exists:', error);
    return false;
  }
};

// Assign the helper functions to an object
const imageHelper = {
  getImageUrl,
  getCategoryImageUrl,
  getProductImageUrl,
  getPaymentProofUrl,
  getUserAvatarUrl,
  checkImageExists
};

// Export the named object as the default export
export default imageHelper;
