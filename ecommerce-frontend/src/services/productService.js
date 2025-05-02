import { apiClient, handleApiError, makeApiRequest } from '../utils/apiHelper';
import { authService } from './authService';

// Improved cache implementation
const cache = {
    products: null,
    productDetails: {},
    cacheTime: 5 * 60 * 1000, // 5 minutes in milliseconds
    lastFetched: null,
    productDetailsFetchTime: {},
    // Keep track of products currently being fetched to avoid duplicate requests
    pendingRequests: {},
};

const getAuthHeaders = () => {
    const token = authService.getToken();
    if (!token) {
        console.error("No auth token found for admin operation");
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Function to check if cache is valid
const isCacheValid = () => {
    return cache.lastFetched && (Date.now() - cache.lastFetched < cache.cacheTime);
};

// Function to check if product detail cache is valid for a specific product
const isProductCacheValid = (productId) => {
    return cache.productDetailsFetchTime[productId] && 
           (Date.now() - cache.productDetailsFetchTime[productId] < cache.cacheTime);
};

// Get all products with optional caching
const getAllProducts = async (catalogId = null, useCache = true) => {
    try {
        // If cache is valid and we want to use cache, return cached data
        if (useCache && isCacheValid() && cache.products) {
            console.log('Using cached products data');
            return catalogId 
                ? cache.products.filter(p => p.catalog_id === catalogId) 
                : cache.products;
        }        const params = catalogId ? { catalogId } : {};
        const requestUrl = `/products`;
        console.log('Requesting products from URL:', requestUrl); 
        
        const data = await makeApiRequest(
            () => apiClient.get(requestUrl, { params }), 
            'Failed to fetch products'
        );
          // Update cache
        cache.products = data;
        cache.lastFetched = Date.now();
        
        return data;
    } catch (error) {
        console.error('Error fetching products:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal mengambil data produk');
    }
};

// Get featured or popular products
const getFeaturedProducts = async (limit = 8) => {
    try {
        // If we have cached products, sort them by some criteria (e.g., rating)
        if (isCacheValid() && cache.products) {
            console.log('Using cached data for featured products');
            return [...cache.products]
                .sort((a, b) => {
                    // Sort by rating if available, otherwise by id (newest)
                    if (a.stats?.rating && b.stats?.rating) {
                        return b.stats.rating - a.stats.rating;
                    }
                    return b.id - a.id; // Newer products first
                })
                .slice(0, limit);
        }
        
        try {
            // If no cache, fetch all products and then sort
            const allProducts = await getAllProducts(null, true);
            return allProducts
                .sort((a, b) => {
                    if (a.stats?.rating && b.stats?.rating) {
                        return b.stats.rating - a.stats.rating;
                    }
                    return b.id - a.id;
                })
                .slice(0, limit);
        } catch (innerError) {
            console.error('Error in getAllProducts call:', innerError);
            throw innerError;
        }
    } catch (error) {
        // Use our handleApiError utility for consistent error handling
        console.error('Error fetching featured products:', error);
        const handledError = handleApiError(error, 'Gagal mengambil produk unggulan');
        throw handledError;
    }
};

// Get product details with improved caching and request deduplication
const getProductById = async (productId) => {
    try {
        // Validate productId
        if (!productId || productId === 'undefined' || productId === undefined) {
            throw new Error('Invalid product ID');
        }
        
        // Check if product is in cache and the cache is still valid
        if (cache.productDetails[productId] && isProductCacheValid(productId)) {
            console.log(`Using cached data for product ${productId}`);
            return cache.productDetails[productId];
        }

        // Check if this product is already being fetched to avoid duplicate requests
        if (cache.pendingRequests[productId]) {
            console.log(`Request for product ${productId} already in progress, joining existing request`);
            return cache.pendingRequests[productId];
        }

        // Create a promise for this request and store it
        cache.pendingRequests[productId] = makeApiRequest(
            () => apiClient.get(`/products/${productId}`), 
            'Failed to fetch product details'
        ).then(data => {
            // Cache the product details
            cache.productDetails[productId] = data;
            cache.productDetailsFetchTime[productId] = Date.now();
            
            // Clear the pending request
            delete cache.pendingRequests[productId];
            
            return data;
        }).catch(error => {
            // Clear the pending request on error
            delete cache.pendingRequests[productId];
            throw error;
        });
        
        // Return the promise
        return await cache.pendingRequests[productId];
    } catch (error) {
        // Use our handleApiError utility for consistent error handling
        const handledError = handleApiError(error, `Gagal mengambil detail produk ID: ${productId}`);
        throw handledError;
    }
};

// --- Fungsi Khusus Admin ---

// Mengambil semua produk untuk admin (mungkin data lebih lengkap atau endpoint berbeda)
const getAllProductsAdmin = async () => {
    try {
        // Log URL yang akan di-request untuk debugging
        const requestUrl = `/products`;
        console.log('Requesting admin products from URL:', requestUrl);
        
        const data = await makeApiRequest(
            () => apiClient.get(requestUrl, { 
                headers: getAuthHeaders() 
            }), 
            'Failed to fetch admin products'
        );
        
        return data;
    } catch (error) {
        // Use our handleApiError utility for consistent error handling
        const handledError = handleApiError(error, 'Gagal mengambil data produk admin');
        throw handledError;
    }
};

// Membuat produk baru (memerlukan FormData karena mungkin ada file gambar)
const createProduct = async (productData) => {
    try {
        // productData harus berupa objek FormData
        const data = await makeApiRequest(
            () => apiClient.post('/products', productData, { 
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data', // Penting untuk upload file
                }
            }),
            'Failed to create product'
        );
        
        // Clear cache after creating a new product
        cache.products = null;
        cache.lastFetched = null;
        
        return data;
    } catch (error) {
        // Use our handleApiError utility for consistent error handling
        const handledError = handleApiError(error, 'Gagal membuat produk baru');
        throw handledError;
    }
};

// Mengupdate produk (memerlukan FormData)
const updateProduct = async (productId, productData) => {
    try {
        // Validate productId
        if (!productId || productId === 'undefined' || productId === undefined) {
            throw new Error('Invalid product ID');
        }
        
        // productData harus berupa objek FormData
        const data = await makeApiRequest(
            () => apiClient.put(`/products/${productId}`, productData, { 
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                }
            }),
            `Failed to update product ID: ${productId}`
        );
        
        // Clear cache after updating a product
        cache.products = null;
        cache.lastFetched = null;
        if (cache.productDetails[productId]) {
            delete cache.productDetails[productId];
        }
        
        return data;
    } catch (error) {
        // Use our handleApiError utility for consistent error handling
        const handledError = handleApiError(error, `Gagal memperbarui produk ID: ${productId}`);
        throw handledError;
    }
};

// Menghapus produk
const deleteProduct = async (productId) => {
    try {
        // Validate productId
        if (!productId || productId === 'undefined' || productId === undefined) {
            throw new Error('Invalid product ID');
        }
        
        const data = await makeApiRequest(
            () => apiClient.delete(`/products/${productId}`, { 
                headers: getAuthHeaders() 
            }),
            `Failed to delete product ID: ${productId}`
        );
        
        // Clear cache after deleting a product
        cache.products = null;
        cache.lastFetched = null;
        if (cache.productDetails[productId]) {
            delete cache.productDetails[productId];
        }
        
        return data;
    } catch (error) {
        // Use our handleApiError utility for consistent error handling
        const handledError = handleApiError(error, `Gagal menghapus produk ID: ${productId}`);
        throw handledError;
    }
};

// Function to prefetch product details (call this early to have data ready when needed)
const prefetchProductDetails = async (productId) => {
    try {
        if (!productId || isProductCacheValid(productId)) return;
        
        // Just call getProductById which will handle caching
        await getProductById(productId);
        console.log(`Prefetched product ${productId} details`);
    } catch (err) {
        console.error(`Error prefetching product ${productId}:`, err);
        // Don't throw - this is just prefetching
    }
};

// Bulk prefetch for multiple products (useful for lists where user might click any item)
const prefetchMultipleProducts = async (productIds) => {
    if (!Array.isArray(productIds) || productIds.length === 0) return;
    
    // Use Promise.all to fetch in parallel but limit concurrency
    const batchSize = 3; // Fetch 3 at a time to avoid overwhelming the server
    
    for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        try {
            await Promise.all(batch.map(id => prefetchProductDetails(id)));
        } catch (err) {
            console.error('Error prefetching batch of products:', err);
            // Continue to the next batch
        }
    }
};

export const productService = {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getAllProductsAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    prefetchProductDetails,
    prefetchMultipleProducts
};