const express = require('express');
const router = express.Router();
const pool = require('../database/db.js'); // Impor pool dari db.js
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

// Get all products with category name
router.get('/', async (req, res) => {
    try {
        // LEFT JOIN untuk mendapatkan nama kategori
        const queryText = `
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_deleted = false OR p.is_deleted IS NULL
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(queryText);
        
        // Process image URLs to ensure they're properly formatted
        const formattedProducts = result.rows.map(product => {
            // Make sure image_url is properly formatted
            if (product.image_url) {
                // If image_url starts with '/images/', this is from seed data
                if (product.image_url.startsWith('/images/')) {
                    // Keep as is, the frontend will handle it
                }
                // If image_url already includes the uploads/products path, don't modify it
                else if (product.image_url.includes('uploads/products/')) {
                    // Already correctly formatted
                }
                // If image_url is "products/image.jpg" (from database), prepend "uploads/"
                else if (product.image_url.startsWith('products/')) {
                    product.image_url = `uploads/${product.image_url}`;
                }
                // If image_url is just a filename (e.g., "image.jpg")
                else if (!product.image_url.startsWith('/') && !product.image_url.includes('http')) {
                    product.image_url = `uploads/products/${product.image_url}`;
                }
            }
            return product;
        });
        
        res.json(formattedProducts);
    } catch (err) {
        console.error('Error fetching products with categories:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single product with category name and id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate id parameter
        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        // Convert id to integer and validate
        const productId = parseInt(id);
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Product ID must be a number' });
        }
        
        // LEFT JOIN untuk mendapatkan nama kategori
        const queryText = `
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)
        `;
        const result = await pool.query(queryText, [productId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Format the product image URL
        const product = result.rows[0];
        if (product.image_url) {
            // If image_url starts with '/images/', this is from seed data
            if (product.image_url.startsWith('/images/')) {
                // Keep as is, the frontend will handle it
            } 
            // If image_url already includes the uploads/products path, don't modify it
            else if (product.image_url.includes('uploads/products/')) {
                // Already correctly formatted
            }
            // If image_url is "products/image.jpg" (from database), prepend "uploads/"
            else if (product.image_url.startsWith('products/')) {
                product.image_url = `uploads/${product.image_url}`;
            }
            // If image_url is just a filename (e.g., "image.jpg")
            else if (!product.image_url.startsWith('/') && !product.image_url.includes('http')) {
                product.image_url = `uploads/products/${product.image_url}`;
            }
        }
        
        res.json(product); // Mengembalikan produk dengan category_name
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
        }        const { id } = req.params;
        
        // Validate id parameter
        if (!id || id === 'undefined') {
            // Clean up temp file if there is one
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        // Convert id to integer and validate
        const productId = parseInt(id);
        if (isNaN(productId)) {
            // Clean up temp file if there is one
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Product ID must be a number' });
        }
        
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
            let queryText;            let queryParams;
            if (imageFile) {
                queryText = 'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock = $5, image_url = $6 WHERE id = $7 RETURNING *';
                queryParams = [name, description, price, category_id, stock, imagePathForDb, productId];
            } else {
                queryText = 'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock = $5 WHERE id = $6 RETURNING *';
                queryParams = [name, description, price, category_id, stock, productId];
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
        
        // Validate id parameter
        if (!id || id === 'undefined') {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        // Convert id to integer and validate
        const productId = parseInt(id);
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Product ID must be a number' });
        }
        
        // Implement soft delete by setting is_deleted flag to true
        const result = await pool.query(
            'UPDATE products SET is_deleted = true WHERE id = $1 RETURNING *',
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// API endpoint to check if an image exists
router.get('/check-image/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Sanitize the filename to prevent path traversal
        const sanitizedFilename = path.basename(filename);
        
        // Check different possible locations for the image
        const possiblePaths = [
            path.join(uploadDir, sanitizedFilename), // Direct in products folder
            path.join(__dirname, `../../uploads/${sanitizedFilename}`), // In uploads root
            path.join(__dirname, `../../uploads/products/${sanitizedFilename}`), // In products subfolder
        ];
        
        // Check if any of the paths exist
        for (const imagePath of possiblePaths) {
            if (fs.existsSync(imagePath)) {
                return res.json({ exists: true, path: `/uploads/products/${sanitizedFilename}` });
            }
        }
        
        // If no match found
        res.json({ exists: false });
    } catch (err) {
        console.error('Error checking image existence:', err);
        res.status(500).json({ error: 'Server error checking image' });
    }
});

module.exports = router;