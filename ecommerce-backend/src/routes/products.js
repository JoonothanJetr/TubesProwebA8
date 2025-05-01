const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan direktori uploads ada
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(path.join(__dirname, '../../uploads'))){ fs.mkdirSync(path.join(__dirname, '../../uploads')); }
if (!fs.existsSync(uploadDir)){ fs.mkdirSync(uploadDir); }

// Konfigurasi Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Folder penyimpanan
    },
    filename: function (req, file, cb) {
        // Buat nama file unik: timestamp + nama asli
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')); 
    }
});

// Konfigurasi Multer File Filter (Validasi Tipe)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Hanya file gambar (JPEG, JPG, PNG) yang diizinkan!'), false);
    }
};

// Inisialisasi Multer Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas 5MB
    fileFilter: fileFilter
}).single('image'); // Menangani satu file dengan field name 'image'


const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// Get all products with category name
router.get('/', async (req, res) => {
    try {
        // LEFT JOIN untuk mendapatkan nama kategori
        const queryText = `
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(queryText);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products with categories:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single product with category name and id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // LEFT JOIN untuk mendapatkan nama kategori
        const queryText = `
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `;
        const result = await pool.query(queryText, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(result.rows[0]); // Mengembalikan produk dengan category_name
    } catch (err) {
        console.error('Error fetching single product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product (Admin only) - Use category_id
router.post('/', auth.isAdmin, (req, res) => { // Use isAdmin middleware
    upload(req, res, async (err) => {
        if (err) {
            // Tangani error dari multer (misal: file terlalu besar, tipe salah)
            console.error('Multer error:', err.message);
            // Cek jenis error spesifik jika perlu
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Ukuran file terlalu besar. Maksimal 5MB.' });
            }
            return res.status(400).json({ error: err.message || 'Error upload gambar.' });
        }

        // Pastikan user admin (setelah middleware auth)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Dapatkan category_id dari body, bukan category
        const { name, description, price, category_id, stock } = req.body;
        const imageFile = req.file;

        // Validasi input dasar (gunakan category_id)
        if (!name || !price || !category_id || !stock) {
            if (imageFile) fs.unlinkSync(imageFile.path); 
            return res.status(400).json({ error: 'Nama, Harga, Kategori ID, dan Stok wajib diisi.' });
        }
        if (!imageFile) {
             return res.status(400).json({ error: 'Gambar produk wajib diupload.' });
         }

        const imagePathForDb = path.join('products', imageFile.filename).replace(/\\/g, '/');

        try {
            // Gunakan category_id di query INSERT
            const result = await pool.query(
                'INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, description, price, imagePathForDb, category_id, stock]
            );
            // Optional: Ambil nama kategori untuk respons
            const newProduct = result.rows[0];
            const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [newProduct.category_id]);
            newProduct.category_name = catResult.rows.length > 0 ? catResult.rows[0].name : null;
            
            res.status(201).json(newProduct);
        } catch (dbErr) {
            console.error('Database error after upload:', dbErr);
            // Hapus file yang sudah terupload jika ada error DB
            if (imageFile) fs.unlinkSync(imageFile.path); 
            res.status(500).json({ error: 'Server error saat menyimpan produk.' });
        }
    });
});

// Update product (Admin only) - Use category_id
router.put('/:id', auth.isAdmin, (req, res) => { // Use isAdmin middleware
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err.message);
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Ukuran file terlalu besar. Maksimal 5MB.' });
            }
            return res.status(400).json({ error: err.message || 'Error upload gambar.' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { id } = req.params;
        // Ambil category_id dari body, bukan category
        const { name, description, price, category_id, stock } = req.body; 
        const imageFile = req.file; 

        // Validasi input dasar (gunakan category_id)
        if (!name || !price || !category_id || !stock) {
             if (imageFile) fs.unlinkSync(imageFile.path); 
             return res.status(400).json({ error: 'Nama, Harga, Kategori ID, dan Stok wajib diisi.' });
         }

        try {
            let imagePathForDb = null;
            let oldImagePath = null;

            // 1. Dapatkan path gambar lama jika ada file baru yang diupload (untuk dihapus nanti)
            if (imageFile) {
                imagePathForDb = path.join('products', imageFile.filename).replace(/\\/g, '/');
                const oldProductResult = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
                if (oldProductResult.rows.length > 0 && oldProductResult.rows[0].image_url) {
                    oldImagePath = oldProductResult.rows[0].image_url;
                }
            }

            // 2. Bangun query UPDATE menggunakan category_id
            let queryText;
            let queryParams;
            if (imageFile) {
                queryText = 'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock = $5, image_url = $6 WHERE id = $7 RETURNING *';
                queryParams = [name, description, price, category_id, stock, imagePathForDb, id];
            } else {
                queryText = 'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock = $5 WHERE id = $6 RETURNING *';
                queryParams = [name, description, price, category_id, stock, id];
            }

            const result = await pool.query(queryText, queryParams);

            if (result.rows.length === 0) {
                // Jika produk tidak ditemukan, hapus file baru jika ada
                if (imageFile) fs.unlinkSync(imageFile.path);
                return res.status(404).json({ error: 'Product not found' });
            }

            // 4. Hapus gambar lama dari storage JIKA update berhasil DAN ada gambar baru DAN ada gambar lama
            if (imageFile && oldImagePath) {
                const oldImageFullPath = path.join(__dirname, '../../uploads', oldImagePath);
                 if (fs.existsSync(oldImageFullPath)) {
                     fs.unlink(oldImageFullPath, (unlinkErr) => {
                         if (unlinkErr) console.error("Error deleting old image:", unlinkErr);
                         else console.log("Old image deleted:", oldImagePath);
                     });
                 }
            }

            // Optional: Ambil nama kategori untuk respons
            const updatedProduct = result.rows[0];
            const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [updatedProduct.category_id]);
            updatedProduct.category_name = catResult.rows.length > 0 ? catResult.rows[0].name : null;

            res.json(updatedProduct);

        } catch (dbErr) {
            console.error('Database error during update:', dbErr);
             // Hapus file baru jika ada error DB
             if (imageFile) fs.unlinkSync(imageFile.path); 
            res.status(500).json({ error: 'Server error saat memperbarui produk.' });
        }
    });
});

// Delete product (Admin only)
router.delete('/:id', auth.isAdmin, async (req, res) => { // Use isAdmin middleware
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 