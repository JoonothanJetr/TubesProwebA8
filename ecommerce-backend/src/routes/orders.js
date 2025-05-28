const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Ensure router is exported
module.exports = router;

// Make sure uploads directory exists with proper permissions
const ensureUploadDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
            console.log(`Created directory: ${dir}`);
        } catch (err) {
            console.error(`Error creating directory ${dir}:`, err);
            throw err;
        }
    }
};

// Pastikan direktori uploads/proofs ada
const proofUploadDir = path.join(__dirname, '../../uploads/proofs');
ensureUploadDirExists(proofUploadDir);

// Konfigurasi Multer untuk upload bukti pembayaran
const proofStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        ensureUploadDirExists(proofUploadDir);
        cb(null, proofUploadDir);
    },
    filename: function (req, file, cb) {
        // Add a file extension based on mimetype
        let ext = '';
        switch (file.mimetype) {
            case 'image/jpeg':
            case 'image/jpg':
                ext = '.jpg';
                break;
            case 'image/png':
                ext = '.png';
                break;
            default:
                ext = path.extname(file.originalname);
        }
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniquePrefix + ext);
    }
});

// Validate file upload
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
        return cb(new Error('Hanya file gambar (JPEG, PNG, JPG) yang diizinkan!'), false);
    }
    cb(null, true);
};

// Configure multer upload
const upload = multer({
    storage: proofStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1
    }
}).single('paymentProof');

// Upload payment proof endpoint
router.post('/:id/proof', auth.authenticateToken, async (req, res) => {
    let uploadedFile = null;
    
    try {
        const orderId = req.params.id;
        
        // Get order first to check ownership and existence
        const orderCheck = await pool.query(
            'SELECT user_id, payment_status, payment_method, payment_proof_url FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Pesanan tidak ditemukan'
            });
        }

        const order = orderCheck.rows[0];

        // Check if user owns this order
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                error: 'Anda tidak memiliki akses ke pesanan ini'
            });
        }

        // Check if order is COD
        if (order.payment_method === 'cod') {
            return res.status(400).json({ 
                success: false,
                error: 'Pesanan COD tidak memerlukan bukti pembayaran'
            });
        }

        // Check if payment already confirmed
        if (order.payment_status === 'pembayaran sudah dilakukan') {
            return res.status(400).json({ 
                success: false,
                error: 'Pembayaran sudah dikonfirmasi sebelumnya'
            });
        }

        // Handle file upload
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        reject(new Error('Ukuran file terlalu besar. Maksimal 5MB'));
                    } else {
                        reject(new Error(err.message));
                    }
                } else if (err) {
                    reject(err);
                } else if (!req.file) {
                    reject(new Error('Bukti pembayaran harus diunggah'));
                } else {
                    uploadedFile = req.file;
                    resolve();
                }
            });
        });

        // Start database transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete old proof file if exists
            if (order.payment_proof_url) {
                const oldFilePath = path.join(proofUploadDir, order.payment_proof_url);
                try {
                    await fs.promises.unlink(oldFilePath);
                } catch (err) {
                    console.error('Error deleting old proof file:', err);
                    // Continue even if delete fails
                }
            }            // Update order with new proof URL and status
            const result = await client.query(
                `UPDATE orders 
                 SET payment_proof_url = $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2 AND payment_status = 'menunggu pembayaran'
                 RETURNING *`,
                [uploadedFile.filename, orderId]
            );

            if (result.rows.length === 0) {
                throw new Error('Status pesanan tidak dapat diperbarui');
            }

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Bukti pembayaran berhasil diunggah',
                order: result.rows[0]
            });

        } catch (err) {
            await client.query('ROLLBACK');
            
            // Clean up uploaded file on error
            if (uploadedFile && fs.existsSync(path.join(proofUploadDir, uploadedFile.filename))) {
                try {
                    fs.unlinkSync(path.join(proofUploadDir, uploadedFile.filename));
                } catch (unlinkErr) {
                    console.error('Error deleting uploaded file:', unlinkErr);
                }
            }
            
            throw err;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error in proof upload:', error);
        
        // Clean up uploaded file if exists
        if (uploadedFile && fs.existsSync(path.join(proofUploadDir, uploadedFile.filename))) {
            try {
                fs.unlinkSync(path.join(proofUploadDir, uploadedFile.filename));
            } catch (unlinkErr) {
                console.error('Error deleting uploaded file:', unlinkErr);
            }
        }

        const statusCode = error.message.includes('tidak ditemukan') ? 404 :
                          error.message.includes('tidak memiliki akses') ? 403 :
                          error.message.includes('COD') || 
                          error.message.includes('sudah dikonfirmasi') ||
                          error.message.includes('harus diunggah') ||
                          error.message.includes('terlalu besar') ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message || 'Terjadi kesalahan saat mengunggah bukti pembayaran'
        });
    }
});

// Create order from cart
const { validateOrderData, getInitialOrderStatus } = require('../utils/orderUtils');

router.post('/', auth.authenticateToken, async (req, res) => {
    console.log('Received order request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        userId: req.user?.id
    });

    const userId = req.user.id;
    let validatedData;
    const client = await pool.connect();

    try {
        // Validate order data first
        try {
            console.log('Validating order data...');
            validatedData = validateOrderData(req.body);
            console.log('Order data validated successfully:', validatedData);
        } catch (err) {
            console.error('Order validation failed:', err);
            return res.status(err.status || 400).json({ 
                success: false,
                error: err.message 
            });
        }

        console.log('Beginning database transaction...');
        await client.query('BEGIN');

        const { orderStatus, paymentStatus } = getInitialOrderStatus(validatedData.paymentMethod);
        console.log('Initial order status:', { orderStatus, paymentStatus });

        // Insert order
        const orderInsertQuery = `
            INSERT INTO orders (
                user_id, 
                total_amount, 
                payment_method, 
                order_status, 
                payment_status, 
                desired_completion_date, 
                delivery_address, 
                phone_number,
                delivery_option
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING 
                id, 
                order_status, 
                payment_status, 
                created_at,
                delivery_address, 
                phone_number, 
                payment_method,
                delivery_option
        `;

        console.log('Executing order insert with params:', [
            userId,
            validatedData.totalAmount,
            validatedData.paymentMethod,
            orderStatus,
            paymentStatus,
            validatedData.desiredCompletionDate,
            validatedData.deliveryAddress,
            validatedData.phoneNumber,
            validatedData.deliveryOption || 'pickup'
        ]);

        const orderRes = await client.query(orderInsertQuery, [
            userId,
            validatedData.totalAmount,
            validatedData.paymentMethod,
            orderStatus,
            paymentStatus,
            validatedData.desiredCompletionDate || new Date(),
            validatedData.deliveryAddress,
            validatedData.phoneNumber,
            validatedData.deliveryOption || 'pickup'
        ]);

        const newOrderId = orderRes.rows[0].id;
        const newOrder = orderRes.rows[0];
        console.log('Order created successfully:', newOrder);

        // Process each order item with stock checking
        console.log('Processing order items...');
        for (const item of validatedData.items) {
            console.log('Processing item:', item);
            
            const productCheckRes = await client.query(
                'SELECT id, stock, name, price FROM products WHERE id = $1 FOR UPDATE', 
                [item.product_id]
            );
            
            if (productCheckRes.rows.length === 0) {
                throw Object.assign(
                    new Error(`Produk dengan ID ${item.product_id} tidak ditemukan.`),
                    { status: 404 }
                );
            }

            const product = productCheckRes.rows[0];
            console.log('Product found:', product);

            if (product.stock < item.quantity) {
                throw Object.assign(
                    new Error(`Stok tidak mencukupi untuk produk ${product.name}. Tersedia: ${product.stock}, Diminta: ${item.quantity}`),
                    { status: 400 }
                );
            }

            // Verify price matches current product price
            if (Math.abs(product.price - item.price) > 0.01) {
                throw Object.assign(
                    new Error(`Harga produk ${product.name} telah berubah. Silakan refresh halaman dan coba lagi.`),
                    { status: 400 }
                );
            }

            // Insert order item
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [newOrderId, item.product_id, item.quantity, item.price]
            );

            // Update stock
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
            
            console.log(`Stock updated for product ${item.product_id}`);
        }

        // Clear user's cart
        console.log('Clearing user cart...');
        await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);
        
        console.log('Committing transaction...');
        await client.query('COMMIT');

        res.status(201).json({ 
            success: true,
            message: validatedData.paymentMethod === 'cod' 
                ? 'Pesanan COD berhasil dibuat!' 
                : 'Pesanan berhasil dibuat!',
            order: {
                ...newOrder,
                items: validatedData.items
            }
        });

    } catch (err) {
        console.error('Transaction Error:', err);
        console.error('Error stack:', err.stack);
        
        await client.query('ROLLBACK');

        // Use custom error status if available, otherwise use appropriate status code
        const status = err.status || (
            err.message.includes('tidak ditemukan') ? 404 :
            err.message.includes('tidak mencukupi') || 
            err.message.includes('telah berubah') ? 400 : 500
        );

        const errorResponse = {
            success: false,
            error: status === 500 
                ? 'Terjadi kesalahan server. Silakan coba lagi.' 
                : err.message
        };

        if (status === 500) {
            console.error('Detailed server error:', {
                error: err,
                stack: err.stack,
                query: err.query,
                parameters: err.parameters
            });
        }

        res.status(status).json(errorResponse);
    } finally {
        client.release();
    }
});

// Get all orders
router.get('/', auth.authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT o.*, 
                   u.username, u.email,
                   json_agg(json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price,
                       'name', p.name,
                       'image_url', p.image_url
                   )) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
        `;

        // If user is not admin, only show their orders
        if (req.user.role !== 'admin') {
            query += ' WHERE o.user_id = $1';
        }

        query += ' GROUP BY o.id, u.username, u.email ORDER BY o.created_at DESC';

        const result = req.user.role !== 'admin' 
            ? await pool.query(query, [req.user.id])
            : await pool.query(query);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order by ID
router.get('/:id', auth.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT o.*, 
                   u.username, u.email,
                   json_agg(json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price,
                       'name', p.name,
                       'image_url', p.image_url
                   )) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.id = $1
            GROUP BY o.id, u.username, u.email
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // If user is not admin and not their order, deny access
        if (req.user.role !== 'admin' && result.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status (admin only)
router.put('/:id/status', auth.isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status, payment_status, admin_comment } = req.body;

        const result = await pool.query(
            `UPDATE orders 
             SET order_status = COALESCE($1, order_status),
                 payment_status = COALESCE($2, payment_status),
                 admin_comment = COALESCE($3, admin_comment),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [order_status, payment_status, admin_comment, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin order management endpoints
router.get('/admin/orders', auth.isAdmin, async (req, res) => {
    try {
        // Get filter parameters
        const { paymentStatus, orderStatus } = req.query;
        
        let query = `
            SELECT o.*, 
                   u.username, u.email,
                   json_agg(json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price,
                       'name', p.name,
                       'image_url', p.image_url
                   )) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id`;

        // Add WHERE clause if filters are provided
        const whereConditions = [];
        const params = [];
        let paramCount = 1;

        if (paymentStatus) {
            whereConditions.push(`payment_status = $${paramCount}`);
            params.push(paymentStatus);
            paramCount++;
        }

        if (orderStatus) {
            whereConditions.push(`order_status = $${paramCount}`);
            params.push(orderStatus);
            paramCount++;
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Add GROUP BY and ORDER BY
        query += ' GROUP BY o.id, u.username, u.email ORDER BY o.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all orders:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get orders by status (Admin only)
router.get('/admin/orders/status/:status', auth.isAdmin, async (req, res) => {
    try {
        const { status } = req.params;
        const result = await pool.query(`
            SELECT o.*, 
                   u.username, u.email,
                   json_agg(json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price,
                       'name', p.name,
                       'image_url', p.image_url
                   )) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.order_status = $1
            GROUP BY o.id, u.username, u.email
            ORDER BY o.updated_at DESC
        `, [status]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders by status:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status and add admin comment (Admin only)
router.put('/admin/orders/:id', auth.isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status, payment_status, admin_comment } = req.body;

        // Validate status values
        const validOrderStatuses = ['diproses', 'selesai', 'dibatalkan'];
        const validPaymentStatuses = ['menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan'];

        if (order_status && !validOrderStatuses.includes(order_status)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }

        if (payment_status && !validPaymentStatuses.includes(payment_status)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }        // First update the order
        await pool.query(`
            UPDATE orders 
            SET order_status = COALESCE($1, order_status),
                payment_status = COALESCE($2, payment_status),
                admin_comment = COALESCE($3, admin_comment),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4`, 
            [order_status, payment_status, admin_comment, id]
        );

        // Then fetch the complete order data including items and user info
        const result = await pool.query(`
            SELECT o.*, 
                   u.username, u.email,
                   json_agg(json_build_object(
                       'id', oi.id,
                       'product_id', oi.product_id,
                       'quantity', oi.quantity,
                       'price', oi.price,
                       'name', p.name,
                       'image_url', p.image_url
                   )) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.id = $1
            GROUP BY o.id, u.username, u.email
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ 
            message: 'Order updated successfully', 
            order: result.rows[0] 
        });
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel order endpoint
router.post('/:id/cancel', auth.authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const orderId = req.params.id;
        
        // Check if order exists and can be cancelled
        const orderCheck = await client.query(
            'SELECT user_id, order_status, payment_status FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderCheck.rows.length === 0) {
            throw new Error('Pesanan tidak ditemukan');
        }

        const order = orderCheck.rows[0];

        // Verify user owns this order
        if (order.user_id !== req.user.id) {
            throw new Error('Tidak diizinkan membatalkan pesanan ini');
        }

        // Check if order can be cancelled
        if (order.order_status !== 'diproses' || order.payment_status !== 'menunggu pembayaran') {
            throw new Error('Pesanan tidak dapat dibatalkan dalam status ini');
        }

        // Update order status
        const result = await client.query(
            `UPDATE orders 
             SET order_status = 'dibatalkan',
                 payment_status = 'pembayaran dibatalkan',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [orderId]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Pesanan berhasil dibatalkan',
            order: result.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ 
            success: false,
            error: err.message || 'Gagal membatalkan pesanan'
        });
    } finally {
        client.release();
    }
});

// Delete order history by filter (Admin only)
router.post('/delete-history', auth.isAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const filters = req.body;
        let queryParams = [];
        let conditions = [];
        let paramIndex = 1;
        
        // Build query conditions based on filters
        if (filters.paymentStatus) {
            conditions.push(`payment_status = $${paramIndex}`);
            queryParams.push(filters.paymentStatus);
            paramIndex++;
        }
        
        if (filters.orderStatus) {
            conditions.push(`order_status = $${paramIndex}`);
            queryParams.push(filters.orderStatus);
            paramIndex++;
        }
        
        if (filters.customerId) {
            conditions.push(`user_id = $${paramIndex}`);
            queryParams.push(filters.customerId);
            paramIndex++;
        }
        
        if (filters.dateRange && filters.dateRange.start) {
            conditions.push(`created_at >= $${paramIndex}`);
            queryParams.push(filters.dateRange.start);
            paramIndex++;
        }
        
        if (filters.dateRange && filters.dateRange.end) {
            conditions.push(`created_at <= $${paramIndex}`);
            queryParams.push(`${filters.dateRange.end} 23:59:59`);
            paramIndex++;
        }
        
        // If no conditions, don't allow deleting all orders
        if (conditions.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Setidaknya satu filter harus ditentukan untuk menghapus riwayat pesanan'
            });
        }
        
        // Get order IDs that match the filter
        const whereClause = conditions.join(' AND ');
        const orderIdsQuery = `SELECT id, payment_proof_url FROM orders WHERE ${whereClause}`;
        const orderIdsResult = await client.query(orderIdsQuery, queryParams);
        
        if (orderIdsResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.json({
                success: true,
                message: 'Tidak ada pesanan yang cocok dengan filter'
            });
        }
        
        // Delete order items for all matched orders
        const orderIds = orderIdsResult.rows.map(row => row.id);
        await client.query(`DELETE FROM order_items WHERE order_id IN (${orderIds.map((_, i) => `$${i+1}`).join(',')})`, orderIds);
        
        // Delete payment proof files if they exist
        for (const order of orderIdsResult.rows) {
            if (order.payment_proof_url) {
                const proofPath = path.join(proofUploadDir, order.payment_proof_url);
                try {
                    if (fs.existsSync(proofPath)) {
                        fs.unlinkSync(proofPath);
                    }
                } catch (err) {
                    console.error(`Error deleting proof file for order ${order.id}:`, err);
                    // Continue with order deletion even if file delete fails
                }
            }
        }
        
        // Delete the orders
        const deleteResult = await client.query(`DELETE FROM orders WHERE id IN (${orderIds.map((_, i) => `$${i+1}`).join(',')})`, orderIds);
        
        await client.query('COMMIT');
        
        res.json({
            success: true,
            message: `${orderIds.length} pesanan berhasil dihapus`,
            count: orderIds.length
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting order history:', err);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus riwayat pesanan',
            error: err.message
        });
    } finally {
        client.release();
    }
});

// Delete single order (Admin only) 
router.delete('/:id', auth.isAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;

        // Check if order exists
        const checkOrder = await client.query(
            'SELECT id, payment_proof_url FROM orders WHERE id = $1',
            [id]
        );

        if (checkOrder.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
                success: false,
                message: 'Pesanan tidak ditemukan' 
            });
        }

        const order = checkOrder.rows[0];

        // Delete order items first due to foreign key constraint
        await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);

        // Delete payment proof file if exists
        if (order.payment_proof_url) {
            const proofPath = path.join(proofUploadDir, order.payment_proof_url);
            try {
                if (fs.existsSync(proofPath)) {
                    fs.unlinkSync(proofPath);
                }
            } catch (err) {
                console.error('Error deleting proof file:', err);
                // Continue with order deletion even if file delete fails
            }
        }

        // Delete the order
        await client.query('DELETE FROM orders WHERE id = $1', [id]);

        await client.query('COMMIT');

        res.json({ 
            success: true,
            message: 'Pesanan berhasil dihapus' 
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting order:', err);
        res.status(500).json({ 
            success: false,
            message: 'Terjadi kesalahan saat menghapus pesanan'
        });
    } finally {
        client.release();
    }
});