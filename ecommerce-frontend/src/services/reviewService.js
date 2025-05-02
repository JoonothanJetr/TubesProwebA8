import { apiClient, handleApiError, makeApiRequest } from '../utils/apiHelper';

export const reviewService = {    getProductReviews: async (productId) => {
        try {
            // Validate productId
            if (!productId || productId === 'undefined' || productId === undefined) {
                throw new Error('Invalid product ID');
            }
            
            // Convert to integer if it's a string
            const productIdInt = typeof productId === 'string' ? parseInt(productId, 10) : productId;
            if (isNaN(productIdInt)) {
                throw new Error('Product ID must be a valid number');
            }
            
            return await makeApiRequest(
                () => apiClient.get(`/reviews/product/${productIdInt}`),
                `Failed to fetch reviews for product ID: ${productIdInt}`
            );
        } catch (error) {
            const handledError = handleApiError(error, `Gagal mengambil ulasan untuk produk ID: ${productId}`);
            throw handledError;
        }
    },    getUserReviews: async () => {
        try {
            return await makeApiRequest(
                () => apiClient.get('/reviews/user'),
                'Failed to fetch user reviews'
            );
        } catch (error) {
            const handledError = handleApiError(error, 'Gagal mengambil ulasan pengguna');
            throw handledError;
        }
    },    createReview: async (productId, rating, comment) => {
        try {
            // Validate productId
            if (!productId || productId === 'undefined' || productId === undefined) {
                throw new Error('Invalid product ID');
            }
            
            // Convert to integer if it's a string
            const productIdInt = typeof productId === 'string' ? parseInt(productId, 10) : productId;
            if (isNaN(productIdInt)) {
                throw new Error('Product ID must be a valid number');
            }
            
            return await makeApiRequest(
                () => apiClient.post('/reviews', {
                    product_id: productIdInt,
                    rating,
                    comment
                }),
                'Failed to create review'
            );
        } catch (error) {
            const handledError = handleApiError(error, 'Gagal mengirim ulasan');
            throw handledError;
        }
    },    updateReview: async (reviewId, rating, comment) => {
        try {
            // Validate reviewId
            if (!reviewId || reviewId === 'undefined' || reviewId === undefined) {
                throw new Error('Invalid review ID');
            }
            
            // Convert to integer if it's a string
            const reviewIdInt = typeof reviewId === 'string' ? parseInt(reviewId, 10) : reviewId;
            if (isNaN(reviewIdInt)) {
                throw new Error('Review ID must be a valid number');
            }
            
            return await makeApiRequest(
                () => apiClient.put(`/reviews/${reviewIdInt}`, {
                    rating,
                    comment
                }),
                'Failed to update review'
            );
        } catch (error) {
            const handledError = handleApiError(error, 'Gagal memperbarui ulasan');
            throw handledError;
        }
    },    deleteReview: async (reviewId) => {
        try {
            // Validate reviewId
            if (!reviewId || reviewId === 'undefined' || reviewId === undefined) {
                throw new Error('Invalid review ID');
            }
            
            // Convert to integer if it's a string
            const reviewIdInt = typeof reviewId === 'string' ? parseInt(reviewId, 10) : reviewId;
            if (isNaN(reviewIdInt)) {
                throw new Error('Review ID must be a valid number');
            }
            
            return await makeApiRequest(
                () => apiClient.delete(`/reviews/${reviewIdInt}`),
                'Failed to delete review'
            );
        } catch (error) {
            const handledError = handleApiError(error, 'Gagal menghapus ulasan');
            throw handledError;
        }
    },    getProductRatingStats: async (productId) => {
        try {
            // Validate productId
            if (!productId || productId === 'undefined' || productId === undefined) {
                throw new Error('Invalid product ID');
            }
            
            // Convert to integer if it's a string
            const productIdInt = typeof productId === 'string' ? parseInt(productId, 10) : productId;
            if (isNaN(productIdInt)) {
                throw new Error('Product ID must be a valid number');
            }
            
            return await makeApiRequest(
                () => apiClient.get(`/reviews/stats/product/${productIdInt}`),
                `Failed to fetch rating stats for product ID: ${productIdInt}`
            );
        } catch (error) {
            const handledError = handleApiError(error, `Gagal mengambil statistik rating untuk produk ID: ${productId}`);
            throw handledError;
        }
    }
}; 