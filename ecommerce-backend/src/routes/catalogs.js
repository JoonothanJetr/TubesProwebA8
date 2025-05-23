const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth'); // Import middleware auth

// Konfigurasi pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// GET all categories (Publik - untuk dropdown form)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET single category (Mungkin tidak perlu, tapi bisa ditambahkan)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST new category (Admin only)
router.post('/', auth.isAdmin, async (req, res) => {
    // if (req.user.role !== 'admin') { // Check already done by isAdmin middleware
    //     return res.status(403).json({ error: 'Access denied. Admins only.' });
    // }
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    try {
        const newCategory = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(newCategory.rows[0]);
    } catch (err) {
        // Handle potential unique constraint violation (jika nama kategori sudah ada)
        if (err.code === '23505') { // Unique violation code for PostgreSQL
            return res.status(400).json({ error: `Category with name '${name}' already exists.` });
        }
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update category (Admin only)
router.put('/:id', auth.isAdmin, async (req, res) => { // Use isAdmin middleware
    // if (req.user.role !== 'admin') { // Check already done by isAdmin middleware
    //     return res.status(403).json({ error: 'Access denied. Admins only.' });
    // }
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    try {
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(400).json({ error: `Category with name '${name}' already exists.` });
        }
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// DELETE category (Admin only)
router.delete('/:id', auth.isAdmin, async (req, res) => { // Use isAdmin middleware
    // if (req.user.role !== 'admin') { // Check already done by isAdmin middleware
    //     return res.status(403).json({ error: 'Access denied. Admins only.' });
    // }
    const { id } = req.params;
    try {
        // Cek dulu apakah kategori masih digunakan oleh produk (jika constraint ON DELETE RESTRICT)
        // Jika ON DELETE SET NULL, ini tidak wajib tapi bisa jadi info bagus
        /* const productCheck = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
           if (productCheck.rows[0].count > 0) {
               return res.status(400).json({ error: 'Cannot delete category. It is currently associated with existing products.' });
           }
        */

        const deleteOp = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully', deletedCategory: deleteOp.rows[0] });
    } catch (err) {
        console.error('Error deleting category:', err);
        // Handle constraint jika diset RESTRICT (kode 23503)
        if (err.code === '23503') {
             return res.status(400).json({ error: 'Cannot delete category. It is currently associated with existing products.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the router
module.exports = router;