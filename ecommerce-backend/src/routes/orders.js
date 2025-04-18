const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// Get all orders (Admin) or user's orders (Customer)
router.get('/', auth, async (req, res) => {
    try {
        let result;
        
        if (req.user.role === 'admin') {
            // Admin can see all orders
            result = await pool.query(
                `SELECT o.*, u.username, u.email 
                 FROM orders o 
                 JOIN users u ON o.user_id = u.id 
                 ORDER BY o.created_at DESC`
            );
        } else {
            // Customer can only see their own orders
            result = await pool.query(
                `SELECT * FROM orders 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC`,
                [req.user.id]
            );
        }
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get order
        const orderResult = await pool.query(
            `SELECT o.*, u.username, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = $1`,
            [id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if user has permission to view this order
        if (req.user.role !== 'admin' && orderResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Get order items
        const itemsResult = await pool.query(
            `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [id]
        );
        
        const order = orderResult.rows[0];
        order.items = itemsResult.rows;
        
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create order from cart
router.post('/', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Get cart items
        const cartResult = await client.query(
            `SELECT c.*, p.name, p.price, p.is_available 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = $1`,
            [req.user.id]
        );
        
        if (cartResult.rows.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        
        // Check if all products are available
        const unavailableProducts = cartResult.rows.filter(item => !item.is_available);
        if (unavailableProducts.length > 0) {
            return res.status(400).json({ 
                error: 'Some products are not available',
                products: unavailableProducts.map(p => p.name)
            });
        }
        
        // Calculate total amount
        const totalAmount = cartResult.rows.reduce(
            (total, item) => total + (item.price * item.quantity), 
            0
        );
        
        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total_amount, status, payment_status) 
             VALUES ($1, $2, 'pending', 'unpaid') 
             RETURNING *`,
            [req.user.id, totalAmount]
        );
        
        const order = orderResult.rows[0];
        
        // Create order items
        for (const item of cartResult.rows) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
                 VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.quantity, item.price]
            );
        }
        
        // Clear cart
        await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
        
        await client.query('COMMIT');
        
        res.status(201).json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Update order status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update payment status
router.put('/:id/payment', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        
        // Validate payment status
        const validStatuses = ['unpaid', 'paid', 'failed'];
        if (!validStatuses.includes(payment_status)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }
        
        // Get order
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if user has permission to update this order
        if (req.user.role !== 'admin' && orderResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
            [payment_status, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel order (Customer only)
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(403).json({ error: 'Admins cannot cancel orders this way' });
        }
        
        const { id } = req.params;
        
        // Get order
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if order can be cancelled
        const order = orderResult.rows[0];
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Only pending orders can be cancelled' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            ['cancelled', id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 