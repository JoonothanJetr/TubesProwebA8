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

// Get user's cart
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, p.name, p.price, p.image_url 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = $1`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add item to cart
router.post('/', auth, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        
        // Check if product exists
        const productExists = await pool.query(
            'SELECT * FROM products WHERE id = $1 AND is_available = true',
            [product_id]
        );
        
        if (productExists.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or not available' });
        }
        
        // Check if item already in cart
        const existingItem = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
            [req.user.id, product_id]
        );
        
        if (existingItem.rows.length > 0) {
            // Update quantity if item exists
            const result = await pool.query(
                'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
                [quantity, req.user.id, product_id]
            );
            return res.json(result.rows[0]);
        }
        
        // Add new item to cart
        const result = await pool.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, product_id, quantity]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update cart item quantity
router.put('/:product_id', auth, async (req, res) => {
    try {
        const { product_id } = req.params;
        const { quantity } = req.body;
        
        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }
        
        const result = await pool.query(
            'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
            [quantity, req.user.id, product_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove item from cart
router.delete('/:product_id', auth, async (req, res) => {
    try {
        const { product_id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
            [req.user.id, product_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
        res.json({ message: 'Cart cleared successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 