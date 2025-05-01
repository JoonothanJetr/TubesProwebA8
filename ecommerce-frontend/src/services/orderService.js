import api from '../utils/axios';

export const orderService = {
    getAllOrders: async (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
        if (filters.orderStatus) queryParams.append('orderStatus', filters.orderStatus);

        const queryString = queryParams.toString();
        
        try {
            const response = await api.get(`/orders${queryString ? `?${queryString}` : ''}`);
            return response.data;
        } catch (error) {
            console.error('Error in getAllOrders service:', error.response || error.message);
            throw error;
        }
    },

    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Error in createOrder service:', error.response || error.message);
            throw error;
        }
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
    },

    uploadPaymentProof: async (orderId, formData) => {
        try {
            const response = await api.put(`/orders/${orderId}/upload-proof`, formData);
            return response.data;
        } catch (error) {
            console.error('Error in uploadPaymentProof service:', error.response || error.message);
            throw error;
        }
    },

    adminUpdateOrder: async (orderId, updateData) => {
        try {
            const response = await api.put(`/orders/${orderId}/admin/status`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error in adminUpdateOrder service:', error.response || error.message);
            throw error;
        }
    },

    getSalesData: async () => {
        try {
            const response = await api.get('/orders/sales-data');
            return response.data;
        } catch (error) {
            console.error('Error fetching sales data:', error.response?.data || error.message);
            throw error;
        }
    }
};