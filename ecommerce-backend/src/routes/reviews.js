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

// Get all reviews for a product
router.get('/product/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        
        // Validate product_id parameter
        if (!product_id || product_id === 'undefined') {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        // Convert product_id to integer and validate
        const productId = parseInt(product_id);
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Product ID must be a number' });
        }
        
        const result = await pool.query(
            `SELECT r.*, u.username 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = $1 
             ORDER BY r.created_at DESC`,
            [productId]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's reviews
router.get('/user', auth.authenticateToken, async (req, res) => { // Use authenticateToken middleware
    try {
        const result = await pool.query(
            `SELECT r.*, p.name as product_name, p.image_url 
             FROM reviews r 
             JOIN products p ON r.product_id = p.id 
             WHERE r.user_id = $1 
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create review
router.post('/', auth.authenticateToken, async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        // Check if product exists
        const productExists = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [product_id]
        );
        
        if (productExists.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Check if user has already reviewed this product
        const existingReview = await pool.query(
            'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
            [req.user.id, product_id]
        );
        
        if (existingReview.rows.length > 0) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }
        
        // Create review
        const result = await pool.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, product_id, rating, comment]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update review
router.put('/:id', auth.authenticateToken, async (req, res) => {    try {
        const { id } = req.params;
        
        // Validate id parameter
        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'Invalid review ID' });
        }
        
        // Convert id to integer and validate
        const reviewId = parseInt(id);
        if (isNaN(reviewId)) {
            return res.status(400).json({ error: 'Review ID must be a number' });
        }
        
        const { rating, comment } = req.body;
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        // Check if review exists and belongs to user
        const reviewExists = await pool.query(
            'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (reviewExists.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found or you do not have permission to update it' });
        }        // Update review
        const result = await pool.query(
            'UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 RETURNING *',
            [rating, comment, reviewId]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete review
router.delete('/:id', auth.authenticateToken, async (req, res) => {    try {
        const { id } = req.params;
        
        // Validate id parameter
        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'Invalid review ID' });
        }
        
        // Convert id to integer and validate
        const reviewId = parseInt(id);
        if (isNaN(reviewId)) {
            return res.status(400).json({ error: 'Review ID must be a number' });
        }
        
        // Check if review exists and belongs to user
        const reviewExists = await pool.query(
            'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
            [reviewId, req.user.id]
        );
        
        if (reviewExists.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found or you do not have permission to delete it' });
        }
          // Delete review
        await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
        
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get product rating statistics
router.get('/stats/product/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        
        // Validate product_id parameter
        if (!product_id || product_id === 'undefined') {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        // Convert product_id to integer and validate
        const productId = parseInt(product_id);
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Product ID must be a number' });
        }
        
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
             FROM reviews 
             WHERE product_id = $1`,
            [productId]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 