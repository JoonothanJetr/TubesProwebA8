import api from '../utils/axios';

export const cartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    addToCart: async (productId, quantity) => {
        const response = await api.post('/cart', { product_id: productId, quantity });
        return response.data;
    },

    updateCartItem: async (productId, quantity) => {
        const response = await api.put(`/cart/${productId}`, { quantity });
        return response.data;
    },

    removeFromCart: async (productId) => {
        const response = await api.delete(`/cart/${productId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await api.delete('/cart');
        return response.data;
    }
}; 