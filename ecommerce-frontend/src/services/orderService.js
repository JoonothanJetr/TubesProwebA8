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
            console.error('Error creating order:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    },
    createOrderCOD: async (orderData) => {
        try {
            let items;
            try {
                const itemsString = orderData.get('items');
                items = typeof itemsString === 'string' 
                    ? JSON.parse(itemsString)
                    : itemsString;

                if (!Array.isArray(items)) {
                    throw new Error('Items harus berupa array');
                }

                items = items.map(item => ({
                    product_id: parseInt(item.product_id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                }));
            } catch (e) {
                console.error('Error parsing items:', e);
                throw new Error('Format data item pesanan tidak valid: ' + e.message);
            }

            const totalAmount = parseFloat(orderData.get('totalAmount'));
            if (isNaN(totalAmount) || totalAmount <= 0) {
                throw new Error('Total pembayaran tidak valid');
            }

            const desiredCompletionDate = orderData.get('desiredCompletionDate');
            if (!desiredCompletionDate) {
                throw new Error('Tanggal penyelesaian pesanan harus dipilih');
            }            const payload = {
                paymentMethod: 'cod',
                items: items,
                totalAmount: totalAmount,
                desiredCompletionDate: desiredCompletionDate,
                deliveryOption: orderData.get('deliveryOption') || 'pickup',
                deliveryAddress: orderData.get('deliveryAddress')?.trim() || null,
                phoneNumber: orderData.get('phoneNumber')?.trim() || null
            };

            const response = await api.post('/orders', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating COD order:', error);
            throw error.response?.data || {
                error: error.message || 'Gagal membuat pesanan COD'
            };
        }
    },    createOrderWithProof: async (formData) => {
        try {            // Validate required fields first
            const baseRequiredFields = ['paymentMethod', 'items', 'totalAmount', 'desiredCompletionDate', 'phoneNumber', 'paymentProof'];
            for (const field of baseRequiredFields) {
                if (!formData.get(field)) {
                    throw new Error(`${field} wajib diisi untuk pembayaran non-COD`);
                }
            }

            // Only require delivery address if delivery option is selected
            if (formData.get('deliveryOption') === 'delivery' && !formData.get('deliveryAddress')) {
                throw new Error('Alamat pengiriman wajib diisi untuk opsi pengiriman');
            }

            // Parse and validate items
            let items;
            try {
                const itemsString = formData.get('items');
                items = typeof itemsString === 'string' 
                    ? JSON.parse(itemsString)
                    : itemsString;

                if (!Array.isArray(items)) {
                    throw new Error('Items harus berupa array');
                }

                // Validate each item
                items = items.map(item => ({
                    product_id: parseInt(item.product_id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                }));

                // Update the formData with validated items
                formData.set('items', JSON.stringify(items));
            } catch (e) {
                console.error('Error parsing items:', e);
                throw new Error('Format data item pesanan tidak valid: ' + e.message);
            }

            // Validate payment proof
            const paymentProof = formData.get('paymentProof');
            if (!(paymentProof instanceof File) || !paymentProof.type.startsWith('image/')) {
                throw new Error('Bukti pembayaran harus berupa file gambar');
            }            // First create the order without proof
            const orderResponse = await api.post('/orders', {
                paymentMethod: formData.get('paymentMethod'),
                items: JSON.parse(formData.get('items')),
                totalAmount: parseFloat(formData.get('totalAmount')),
                desiredCompletionDate: formData.get('desiredCompletionDate'),
                deliveryOption: formData.get('deliveryOption') || 'pickup',
                deliveryAddress: formData.get('deliveryAddress'),
                phoneNumber: formData.get('phoneNumber')
            });

            // Then upload the payment proof
            if (orderResponse.data.success) {
                const proofFormData = new FormData();
                proofFormData.append('paymentProof', paymentProof);
                
                const proofResponse = await api.post(`/orders/${orderResponse.data.order.id}/proof`, proofFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return proofResponse.data;
            }
            
            return orderResponse.data;
        } catch (error) {
            console.error('Error creating order with proof:', error);
            // If it's an axios error with response data, throw that
            if (error.response?.data) {
                throw error.response.data;
            }
            // If it's our validation error, throw as is
            if (error.message) {
                throw { error: error.message };
            }
            // Otherwise throw a generic error
            throw { error: 'Gagal membuat pesanan. Silakan coba lagi.' };
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

    cancelOrder: async (orderId) => {
        try {
            const response = await api.post(`/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Error cancelling order:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    },    uploadPaymentProof: async (orderId, formData) => {
        try {
            // Changed to use the correct endpoint and method
            const response = await api.post(`/orders/${orderId}/proof`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in uploadPaymentProof service:', error.response || error.message);
            throw error;
        }
    },

    // Admin specific methods
    getAllOrdersAdmin: async (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
        if (filters.orderStatus) queryParams.append('orderStatus', filters.orderStatus);

        const queryString = queryParams.toString();
        
        try {
            const response = await api.get(`/orders/admin/orders${queryString ? `?${queryString}` : ''}`);
            return response.data;
        } catch (error) {
            console.error('Error in getAllOrdersAdmin service:', error.response || error.message);
            throw error;
        }
    },

    getOrdersByStatus: async (status) => {
        try {
            const response = await api.get(`/orders/admin/orders/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Error in getOrdersByStatus service:', error.response || error.message);
            throw error;
        }
    },

    adminUpdateOrder: async (orderId, updateData) => {
        try {
            const response = await api.put(`/orders/admin/orders/${orderId}`, updateData);
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
    },

    deleteOrderHistory: async (filters) => {
        try {
            const response = await api.post('/orders/delete-history', filters);
            if (response.data.success) {
                return response.data;
            }
            throw new Error(response.data.message || 'Gagal menghapus riwayat pesanan');
        } catch (error) {
            console.error('Error deleting order history:', error);
            throw error.response?.data || error;
        }
    },

    deleteOrder: async (orderId) => {
        try {
            const response = await api.delete(`/orders/${orderId}`);
            if (response.data.success) {
                return response.data;
            }
            throw new Error(response.data.message || 'Gagal menghapus pesanan');
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error.response?.data || error;
        }
    }
};