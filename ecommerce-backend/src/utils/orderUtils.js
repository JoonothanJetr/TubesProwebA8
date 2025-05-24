const validateOrderData = (orderData) => {
    const { paymentMethod, items, totalAmount, deliveryAddress, phoneNumber, desiredCompletionDate, deliveryOption } = orderData;

    try {
        // Basic validation
        if (!paymentMethod) {
            throw new Error('Metode pembayaran harus dipilih.');
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Keranjang belanja kosong.');
        }

        if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
            throw new Error('Total pembayaran tidak valid.');
        }

        if (!desiredCompletionDate) {
            throw new Error('Tanggal penyelesaian pesanan harus dipilih.');
        }

        if (!deliveryOption) {
            throw new Error('Opsi pengiriman harus dipilih.');
        }// Always require phone number for all orders
        if (!phoneNumber || phoneNumber.trim().length === 0) {
            throw new Error('Nomor telepon wajib diisi.');
        }
        if (!/^[0-9+\-\s()]{8,20}$/.test(phoneNumber.trim())) {
            throw new Error('Format nomor telepon tidak valid.');
        }        // Only require delivery address if delivery option is selected
        if (deliveryOption === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length === 0)) {
            throw new Error('Alamat pengiriman wajib diisi untuk opsi pengiriman.');
        }

        // Validate items
        let calculatedTotal = 0;
        for (const item of items) {
            if (!item.product_id || !item.quantity || !item.price) {
                throw new Error('Data item pesanan tidak lengkap.');
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new Error('Jumlah item harus berupa bilangan bulat positif.');
            }
            if (typeof item.price !== 'number' || item.price <= 0) {
                throw new Error('Harga item tidak valid.');
            }
            calculatedTotal += item.quantity * item.price;
        }

        // Validate total amount matches sum of items
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            throw new Error('Total pembayaran tidak sesuai dengan kalkulasi item.');
        }

        return {
            ...orderData,
            deliveryAddress: deliveryAddress?.trim() || null,
            phoneNumber: phoneNumber?.trim() || null,
            items: items.map(item => ({
                ...item,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            }))
        };
    } catch (err) {
        err.status = 400; // Set HTTP status untuk validasi error
        throw err;    }
};

const getInitialOrderStatus= (paymentMethod, hasPaymentProof = false) => {
    // For COD orders
    if (paymentMethod === 'cod') {
        return {
            orderStatus: 'diproses',
            paymentStatus: 'menunggu pembayaran'
        };
    }

    // For non-COD orders
    return {
        orderStatus: 'diproses',
        paymentStatus: hasPaymentProof ? 'pembayaran sudah dilakukan' : 'menunggu pembayaran'
    };
};

module.exports = {
    validateOrderData,
    getInitialOrderStatus
};
