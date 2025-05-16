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

    // Fungsi clearCart ini akan memberitahu backend untuk mengosongkan keranjang pengguna saat ini
    // Ini dipanggil setelah pesanan berhasil dibuat dan dibayar.
    clearCart: async () => {
        try {
            // Memastikan endpoint yang dipanggil adalah /cart/clear-all tanpa parameter tambahan
            const response = await api.delete('/cart/clear-all'); 
            return response.data;
        } catch (error) {
            console.error('Error clearing cart from service:', error.response?.data || error.message);
            // Melempar error agar bisa ditangani di komponen jika perlu
            throw error.response?.data || error; 
        }
    }
};