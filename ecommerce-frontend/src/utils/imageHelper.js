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
    if (!imageUrl || typeof imageUrl !== 'string') {
        return null;
    }

    // Check cache first
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
    
    // Clean up path by:
    // 1. Removing leading slashes
    // 2. Removing any uploads/products/ prefix
    // 3. Removing any /uploads/products/ prefix
    const cleanPath = imageUrl
        .replace(/^\/+/, '')
        .replace(/^uploads\/products\//, '')
        .replace(/^\/uploads\/products\//, '');
    
    // Construct the full URL
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
