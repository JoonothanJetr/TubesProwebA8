const express = require('express');
const router = express.Router();
const pool = require('../database/db.js');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan direktori uploads/products ada
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../../uploads'));
}
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Konfigurasi Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Buat nama file unik dengan timestamp + nama asli (tanpa spasi)
        const uniqueFileName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueFileName);
    }
});

// Konfigurasi Multer File Filter (Validasi Tipe)
const fileFilter = (req, file, cb) => {
    // Periksa mime type
    const allowedTypes = /jpeg|jpg|png/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: Hanya file gambar (JPEG, JPG, PNG) yang diizinkan!'), false);
};

// Inisialisasi Multer Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas 5MB
    fileFilter: fileFilter
}).single('image');

// Get all products
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_deleted = false ORDER BY p.created_at DESC'
        );
          // Format image URLs
        const products = result.rows.map(product => ({
            ...product,
            image_url: product.image_url 
                ? `/product_images/${product.image_url}` 
                : null
        }));
        
        res.json(products);
    } catch (err) {
        console.error('Error in getting products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }        // Format image URL
        const product = {
            ...result.rows[0],
            image_url: result.rows[0].image_url 
                ? `/product_images/${result.rows[0].image_url}` 
                : null
        };
        
        res.json(product);
    } catch (err) {
        console.error('Error in getting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create product (Admin only)
router.post('/', auth.isAdmin, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            // Handle multer specific errors
            if (err instanceof multer.MulterError) {
                switch (err.code) {
                    case 'LIMIT_FILE_SIZE':
                        return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
                    case 'LIMIT_UNEXPECTED_FILE':
                        return res.status(400).json({ error: 'Unexpected field name for file upload.' });
                    default:
                        return res.status(400).json({ error: 'File upload failed: ' + err.message });
                }
            }
            // Handle other errors
            return res.status(400).json({ error: err.message || 'Image upload failed.' });
        }

        const { name, description, price, category_id, stock } = req.body;
        const imageFile = req.file;

        // Validasi input dasar
        if (!name || !price || !category_id || !stock || !imageFile) {
            if (imageFile) fs.unlinkSync(imageFile.path);
            return res.status(400).json({ error: 'Nama, Harga, Kategori ID, Stok, dan Gambar wajib diisi.' });
        }

        try {
            // Simpan nama file saja, tanpa path
            const filename = imageFile.filename;
            
            const result = await pool.query(
                'INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, description, price, filename, category_id, stock]
            );

            const newProduct = result.rows[0];            const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
            newProduct.category_name = catResult.rows[0]?.name || null;
            newProduct.image_url = `/product_images/${filename}`;

            res.status(201).json(newProduct);
        } catch (dbErr) {
            console.error('Database error after upload:', dbErr);
            if (imageFile) fs.unlinkSync(imageFile.path);
            res.status(500).json({ error: 'Server error saat menyimpan produk.' });
        }
    });
});

// Update product (Admin only)
router.put('/:id', auth.isAdmin, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err.message);
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Ukuran file terlalu besar. Maksimal 5MB.' });
            }
            return res.status(400).json({ error: err.message || 'Error upload gambar.' });
        }

        const { id } = req.params;
        const productId = parseInt(id);
        if (!id || id === 'undefined' || isNaN(productId)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const { name, description, price, category_id, stock } = req.body;
        const imageFile = req.file;

        if (!name || !price || !category_id || !stock) {
            if (imageFile) fs.unlinkSync(imageFile.path);
            return res.status(400).json({ error: 'Nama, Harga, Kategori ID, dan Stok wajib diisi.' });
        }

        try {
            let queryText;
            let queryParams;

            // Get old product data for image cleanup
            const oldProduct = await pool.query('SELECT image_url FROM products WHERE id = $1', [productId]);
            if (oldProduct.rows.length === 0) {
                if (imageFile) fs.unlinkSync(imageFile.path);
                return res.status(404).json({ error: 'Product not found' });
            }

            if (imageFile) {
                // If new image uploaded, use new filename
                queryText = 'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock = $5, image_url = $6 WHERE id = $7 RETURNING *';
                queryParams = [name, description, price, category_id, stock, imageFile.filename, productId];

                // Delete old image if exists
                const oldImagePath = path.join(uploadDir, oldProduct.rows[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            } else {
                // If no new image, keep existing image
                queryText = 'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock = $5 WHERE id = $6 RETURNING *';
                queryParams = [name, description, price, category_id, stock, productId];
            }

            const result = await pool.query(queryText, queryParams);
            const updatedProduct = result.rows[0];
            
            // Get category name
            const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
            updatedProduct.category_name = catResult.rows[0]?.name || null;

            res.json(updatedProduct);
        } catch (dbErr) {
            console.error('Database error during update:', dbErr);
            if (imageFile) fs.unlinkSync(imageFile.path);
            res.status(500).json({ error: 'Server error saat memperbarui produk.' });
        }
    });
});

// Soft delete product (Admin only)
router.delete('/:id', auth.isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);
        
        if (!id || id === 'undefined' || isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        // Check if product exists
        const product = await pool.query('SELECT * FROM products WHERE id = $1 AND is_deleted = false', [productId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Soft delete the product
        const result = await pool.query(
            'UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [productId]
        );

        // Delete the image file
        if (product.rows[0].image_url) {
            const imagePath = path.join(uploadDir, product.rows[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;