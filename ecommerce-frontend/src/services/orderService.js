import api from '../utils/axios';

export const orderService = {
    getAllOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    createOrder: async () => {
        const response = await api.post('/orders');
        return response.data;
    },

    updateOrderStatus: async (id, status) => {
        const response = await api.put(`/orders/${id}/status`, { status });
        return response.data;
    },

    updatePaymentStatus: async (id, paymentStatus) => {
        const response = await api.put(`/orders/${id}/payment`, { payment_status: paymentStatus });
        return response.data;
    },

    cancelOrder: async (id) => {
        const response = await api.post(`/orders/${id}/cancel`);
        return response.data;
    }
}; 