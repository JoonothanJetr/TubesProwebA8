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
router.get('/', auth.authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, p.name, p.price, p.image_url, cat.name AS category_name
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             LEFT JOIN categories cat ON p.category_id = cat.id
             WHERE c.user_id = $1`,
            [req.user.id]
        );
        
        // Format image URLs consistently like in products.js
        const formattedItems = result.rows.map(item => {
            if (item.image_url) {                // If image_url starts with '/images/', this is from seed data
                if (item.image_url.startsWith('/images/')) {
                    // Keep as is, the frontend will handle it
                } 
                // If image_url already starts with /product_images/, don't modify it
                else if (item.image_url.startsWith('/product_images/')) {
                    // Already correctly formatted
                }
                // If image_url is just a filename (from upload), add the proper path
                else if (!item.image_url.startsWith('/') && !item.image_url.includes('http')) {
                    item.image_url = `/product_images/${item.image_url}`;
                }
            }
            return item;
        });
        
        res.json(formattedItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add item to cart
router.post('/', auth.authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        
        // Periksa apakah produk ada dan stok mencukupi
        // const productRes = await pool.query('SELECT stock FROM products WHERE id = $1 AND is_available = true', [productId]);
        // Hapus pengecekan is_available
        const productRes = await pool.query('SELECT stock FROM products WHERE id = $1', [product_id]);

        if (productRes.rows.length === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }

        const productStock = productRes.rows[0].stock;
        if (productStock < quantity) {
            return res.status(400).json({ error: 'Stok produk tidak mencukupi' });
        }

        // Periksa apakah item sudah ada di keranjang user
        const cartItemRes = await pool.query('SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2', [req.user.id, product_id]);

        if (cartItemRes.rows.length > 0) {
            // Jika sudah ada, update quantity
            const existingQuantity = cartItemRes.rows[0].quantity;
            const newQuantity = existingQuantity + quantity;

            // Periksa lagi apakah total quantity melebihi stok
            if (productStock < newQuantity) {
                return res.status(400).json({ error: 'Penambahan melebihi stok produk yang tersedia' });
            }
            
            await pool.query('UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3', [newQuantity, req.user.id, product_id]);
            res.json({ message: 'Jumlah produk di keranjang diperbarui', quantity: newQuantity });
        } else {
            // Jika belum ada, tambahkan item baru
            await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)', [req.user.id, product_id, quantity]);
            res.status(201).json({ message: 'Produk berhasil ditambahkan ke keranjang', quantity });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update cart item quantity
router.put('/:product_id', auth.authenticateToken, async (req, res) => {
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

// BARU: Clear all items from cart for the authenticated user
router.delete('/clear-all', auth.authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
        res.json({ message: 'Cart cleared successfully' });
    } catch (err) {
        console.error('Error clearing all cart items:', err);
        res.status(500).json({ error: 'Server error while clearing cart' });
    }
});

// Remove a specific item from cart
router.delete('/:product_id', auth.authenticateToken, async (req, res) => {
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

// Export the router
module.exports = router;