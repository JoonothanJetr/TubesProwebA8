import api from '../utils/axios';

export const reviewService = {
    getProductReviews: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}`);
        return response.data;
    },

    getUserReviews: async () => {
        const response = await api.get('/reviews/user');
        return response.data;
    },

    createReview: async (productId, rating, comment) => {
        const response = await api.post('/reviews', {
            product_id: productId,
            rating,
            comment
        });
        return response.data;
    },

    updateReview: async (reviewId, rating, comment) => {
        const response = await api.put(`/reviews/${reviewId}`, {
            rating,
            comment
        });
        return response.data;
    },

    deleteReview: async (reviewId) => {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    },

    getProductRatingStats: async (productId) => {
        const response = await api.get(`/reviews/stats/product/${productId}`);
        return response.data;
    }
}; 