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
        // Check cache first
        if (imageUrlCache.has(imageUrl)) {
            return imageUrlCache.get(imageUrl);
        }

        // Handle already absolute URLs
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            imageUrlCache.set(imageUrl, imageUrl);
            return imageUrl;
        }

        // Handle blob URLs for previews
        if (imageUrl.startsWith('blob:')) {
            imageUrlCache.set(imageUrl, imageUrl);
            return imageUrl;
        }

        // Clean up the image path
        const cleanPath = imageUrl
            .replace(/^\/+/, '')  // Remove leading slashes
            .replace(/^product_images\//, '')  // Remove product_images/ prefix if exists
            .replace(/^uploads\/products\//, '')  // Remove uploads/products/ prefix if exists
            .replace(/^products\//, '');  // Remove products/ prefix if exists

        // Construct full URL, always using /product_images/ prefix
        const fullUrl = `${API_IMAGE_URL}/product_images/${cleanPath}`;
        
        // Cache and return
        imageUrlCache.set(imageUrl, fullUrl);
        return fullUrl;

    } catch (error) {
        console.error('Error processing image URL:', error);
        return null;
    }
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
