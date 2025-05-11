const express = require('express');
const cors = require('cors');
const pool = require('./database/db'); // Impor pool dari db.js
require('dotenv').config();
const path = require('path'); // Import path

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware untuk logging setiap request (TAMBAHKAN INI)
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.originalUrl}`);
    next();
});

// Static file serving untuk folder uploads
// Ini akan membuat file di dalam /uploads bisa diakses via URL
// Contoh: http://localhost:5000/uploads/products/nama-file.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// BARU: Static file serving khusus untuk folder proofs di bawah /proofs
// Contoh: http://localhost:5000/proofs/nama-file.txt
app.use('/proofs', express.static(path.join(__dirname, '../uploads/proofs')));

// Tambahkan static file serving untuk folder images (untuk seed data)
// Contoh: http://localhost:5000/images/products/nama-file.jpg
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Test database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to database');
        done();
    }
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const catalogRoutes = require('./routes/catalogs');
const userRoutes = require('./routes/users');
const feedbackRoutes = require('./routes/feedback'); // TAMBAHKAN INI

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes); // TAMBAHKAN INI

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SICATE API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});