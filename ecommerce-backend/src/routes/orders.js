const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure router is exported
module.exports = router;

// Pastikan direktori uploads/proofs ada
const proofUploadDir = path.join(__dirname, '../../uploads/proofs');
if (!fs.existsSync(proofUploadDir)) {
    fs.mkdirSync(proofUploadDir, { recursive: true });
}

// Konfigurasi Multer untuk upload bukti pembayaran
const proofStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, proofUploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPEG, PNG, JPG) yang diizinkan!'), false);
    }
};

const uploadProof = multer({ 
    storage: proofStorage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 1024 * 1024 * 5 } 
});

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
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
                phone_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING 
                id, 
                order_status, 
                payment_status, 
                created_at,
                delivery_address, 
                phone_number, 
                payment_method
        `;

        console.log('Executing order insert with params:', [
            userId,
            validatedData.totalAmount,
            validatedData.paymentMethod,
            orderStatus,
            paymentStatus,
            validatedData.desiredCompletionDate,
            validatedData.deliveryAddress,
            validatedData.phoneNumber
        ]);

        const orderRes = await client.query(orderInsertQuery, [
            userId,
            validatedData.totalAmount,
            validatedData.paymentMethod,
            orderStatus,
            paymentStatus,
            validatedData.desiredCompletionDate || new Date(),
            validatedData.deliveryAddress,
            validatedData.phoneNumber
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

// Upload payment proof
router.post('/:id/proof', auth.authenticateToken, uploadProof.single('paymentProof'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const orderId = req.params.id;
    const paymentProofUrl = req.file.filename;

    try {
        // Get order first to check ownership
        const orderCheck = await pool.query(
            'SELECT user_id FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderCheck.rows.length === 0) {
            // Delete uploaded file if order doesn't exist
            fs.unlinkSync(path.join(proofUploadDir, paymentProofUrl));
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user owns this order
        if (orderCheck.rows[0].user_id !== req.user.id) {
            // Delete uploaded file if user doesn't own the order
            fs.unlinkSync(path.join(proofUploadDir, paymentProofUrl));
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update order with payment proof URL and status
        const result = await pool.query(
            `UPDATE orders 
             SET payment_proof_url = $1,
                 payment_status = 'menunggu konfirmasi',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [paymentProofUrl, orderId]
        );

        res.json({
            message: 'Payment proof uploaded successfully',
            order: result.rows[0]
        });
    } catch (err) {
        // Delete uploaded file if database operation fails
        fs.unlinkSync(path.join(proofUploadDir, paymentProofUrl));
        console.error('Error uploading payment proof:', err);
        res.status(500).json({ error: 'Server error' });
    }
});