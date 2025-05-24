// Base URL for API and image requests
const SERVER_URL = import.meta.env.VITE_REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const API_BASE_URL = `${SERVER_URL}/api`;
const API_IMAGE_URL = SERVER_URL;

// Cache for image URLs to avoid repeated processing
const imageUrlCache = new Map();

/**
 * Format product image URL 
 * @param {string} imageUrl - Product image path or URL
 * @returns {string|null} Formatted image URL or null if invalid
 */
export function getProductImageUrl(imageUrl) {
    // Return null for invalid/empty URLs
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl === 'undefined' || imageUrl === 'null') {
        console.warn('Invalid image URL provided:', imageUrl);
        return null;
    }

    try {
        // Check cache first to improve performance
        if (imageUrlCache.has(imageUrl)) {
            return imageUrlCache.get(imageUrl);
        }

        // Handle already absolute URLs (including http/https)
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            imageUrlCache.set(imageUrl, imageUrl);
            return imageUrl;
        }

        // Clean up the image path
        const cleanPath = imageUrl.replace(/^\/+/, '');
        
        // Construct full URL with explicit image type query parameter
        const fullUrl = `${API_IMAGE_URL}/${cleanPath}?type=image/jpeg`;
        
        // Cache and return the result
        imageUrlCache.set(imageUrl, fullUrl);
        return fullUrl;
    } catch (error) {
        console.error('Error processing image URL:', error);
        return null;
    }
    if (imageUrlCache.has(imageUrl)) {
        return imageUrlCache.get(imageUrl);
    }

    // Handle absolute URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        imageUrlCache.set(imageUrl, imageUrl);
        return imageUrl;
    }
    
    // Handle blob URLs (for image preview)
    if (imageUrl.startsWith('blob:')) {
        imageUrlCache.set(imageUrl, imageUrl);
        return imageUrl;
    }

    // If path already starts with product_images, just add base URL
    if (imageUrl.startsWith('/product_images/')) {
        const formattedUrl = `${API_IMAGE_URL}${imageUrl}`;
        imageUrlCache.set(imageUrl, formattedUrl); 
        return formattedUrl;
    }
      // Clean up path and handle all possible prefix variants
    const cleanPath = imageUrl
        .replace(/^\/+/, '')  // Remove leading slashes
        .replace(/^(uploads\/)?products?\//, '')  // Remove any variant of uploads/products/ or products/
        .replace(/^product_images\//, '');  // Remove product_images/ prefix if exists
    
    // Construct the full URL with proper path
    const formattedUrl = `${API_IMAGE_URL}/product_images/${cleanPath}`;
    imageUrlCache.set(imageUrl, formattedUrl);
    return formattedUrl;
}

/**
 * Format payment proof image URL
 */
export function getPaymentProofUrl(imageUrl) {
    if (!imageUrl) return null;
    return `${API_IMAGE_URL}/proofs/${imageUrl.replace(/^\/+/, '')}`;
}

/**
 * Format generic image URL
 */
export function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_IMAGE_URL}/${imageUrl.replace(/^\/+/, '')}`;
}

// Default exports
export default {
    getProductImageUrl,
    getPaymentProofUrl,
    getImageUrl
};
