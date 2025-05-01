const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth'); // Middleware otentikasi & otorisasi

// Konfigurasi pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// Middleware khusus untuk cek admin di semua rute file ini
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

// GET all users (Admin only)
// Pertimbangkan filter by role jika perlu: SELECT * FROM users WHERE role = 'customer'
router.get('/', auth.isAdmin, async (req, res) => { // Use isAdmin middleware
    try {
        // Jangan kirim password hash ke frontend
        const result = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET user by ID (Admin only)
router.get('/:id', auth.isAdmin, async (req, res) => { // Use isAdmin middleware
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE user by ID (Admin only)
router.delete('/:id', auth.isAdmin, async (req, res) => { // Use isAdmin middleware
    const { id } = req.params;
    
    // Optional: Cegah admin menghapus dirinya sendiri?
    if (req.user.id == id) { 
        return res.status(400).json({ error: 'Admin cannot delete themselves.' });
    }

    try {
        // Perlu diperhatikan jika ada foreign key constraint ke tabel lain (misal: orders, reviews)
        // Mungkin perlu menghapus data terkait atau men-set user_id ke null dulu
        const deleteOp = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: `User ${deleteOp.rows[0].email} deleted successfully` });
    } catch (err) {
        console.error('Error deleting user:', err);
         // Handle potential foreign key constraint errors (misal kode 23503)
         if (err.code === '23503') {
             return res.status(400).json({ error: 'Cannot delete user. They may have existing orders or reviews.' });
         }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update user role (Admin only) - Contoh jika ingin tambah fitur edit
/*
router.put('/:id/role', auth, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || (role !== 'admin' && role !== 'customer')) {
        return res.status(400).json({ error: 'Invalid role specified. Use \'admin\' or \'customer\'.' });
    }
    
    // Optional: Cegah admin mengubah role dirinya sendiri?
    if (req.user.id == id) {
        return res.status(400).json({ error: 'Admin cannot change their own role.' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
            [role, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
*/

module.exports = router; 