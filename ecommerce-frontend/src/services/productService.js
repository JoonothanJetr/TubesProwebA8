import { apiClient, handleApiError, makeApiRequest } from '../utils/apiHelper';
import { authService } from './authService';

// Improved cache implementation
const cache = {
    products: null,
    productDetails: {},
    cacheTime: 5 * 60 * 1000, // 5 minutes in milliseconds
    lastFetched: null,
    productDetailsFetchTime: {},
    featuredProducts: null,
    featuredLastFetched: null,
    // Keep track of products currently being fetched to avoid duplicate requests
    pendingRequests: {},
};

// Function to check if cache is valid
const isCacheValid = () => {
    return cache.lastFetched && (Date.now() - cache.lastFetched < cache.cacheTime);
};

// Function to check if featured products cache is valid 
const isFeaturedCacheValid = () => {
    return cache.featuredLastFetched && (Date.now() - cache.featuredLastFetched < cache.cacheTime);
};

// Function to check if product detail cache is valid for a specific product
const isProductCacheValid = (productId) => {
    return cache.productDetailsFetchTime[productId] && 
           (Date.now() - cache.productDetailsFetchTime[productId] < cache.cacheTime);
};

// Helper to verify authentication
const verifyAuth = () => {
    if (!authService.isAuthenticated()) {
        throw new Error('Authentication required');
    }
};

export const productService = {    async getAllProducts() {
        try {
            if (isCacheValid()) {
                return cache.products;
            }

            const response = await apiClient.get('/products');
            cache.products = response.data;
            cache.lastFetched = Date.now();
            
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async getFeaturedProducts(limit = 8) {
        try {
            if (isFeaturedCacheValid()) {
                return cache.featuredProducts;
            }

            const response = await apiClient.get('/products', {
                params: { 
                    limit,
                    featured: true
                }
            });
            
            cache.featuredProducts = response.data;
            cache.featuredLastFetched = Date.now();
            
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async getAllProductsAdmin() {
        try {
            verifyAuth();
            const response = await apiClient.get('/products', {
                params: { admin: true }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async getProductById(id) {
        try {
            if (isProductCacheValid(id)) {
                return cache.productDetails[id];
            }

            const response = await apiClient.get(`/products/${id}`);
            cache.productDetails[id] = response.data;
            cache.productDetailsFetchTime[id] = Date.now();
            
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async createProduct(productData) {
        try {
            verifyAuth();
            const response = await apiClient.post('/products', productData);
            // Invalidate cache after creating new product
            cache.products = null;
            cache.lastFetched = null;
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async updateProduct(id, productData) {
        try {
            verifyAuth();
            const response = await apiClient.put(`/products/${id}`, productData);
            // Invalidate affected caches
            cache.products = null;
            cache.lastFetched = null;
            delete cache.productDetails[id];
            delete cache.productDetailsFetchTime[id];
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async deleteProduct(id) {
        try {
            verifyAuth();
            const response = await apiClient.delete(`/products/${id}`);
            // Invalidate cache after deleting product
            cache.products = null;
            cache.lastFetched = null;
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async prefetchMultipleProducts(productIds) {
        if (!Array.isArray(productIds) || productIds.length === 0) return;
        
        try {
            // Filter out products we already have in cache
            const idsToFetch = productIds.filter(id => !isProductCacheValid(id));
            if (idsToFetch.length === 0) return;

            // Fetch all products in parallel
            const promises = idsToFetch.map(id => 
                this.getProductById(id)
                    .catch(err => {
                        console.error(`Failed to prefetch product ${id}:`, err);
                        return null;
                    })
            );

            // Wait for all fetches to complete
            await Promise.all(promises);
        } catch (error) {
            console.error('Error in prefetchMultipleProducts:', error);
        }
    },

    async prefetchProductDetails(id) {
        if (!id) return;
        try {
            await this.getProductById(id);
        } catch (error) {
            console.error(`Error prefetching product ${id}:`, error);
        }
    }
};