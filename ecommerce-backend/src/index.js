const express = require('express');
const cors = require('cors');
const pool = require('./database/db'); // Impor pool dari db.js
require('dotenv').config();
const path = require('path'); // Import path
const fs = require('fs'); // Import fs untuk memastikan direktori upload

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Disposition']
}));
app.use(express.json());

// Middleware untuk logging setiap request
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.originalUrl}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

// Configure static file serving with proper headers
const staticFileOptions = {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
};

// Static file serving untuk folder uploads/products dengan path /product_images
const productImagesPath = path.join(__dirname, '../uploads/products');
app.use('/product_images', express.static(productImagesPath, staticFileOptions));

// Serve payment proof images with proper headers
const proofImagesPath = path.join(__dirname, '../uploads/proofs');
app.use('/proofs', express.static(proofImagesPath, staticFileOptions));

// Serve seed data images
app.use('/images', express.static(path.join(__dirname, '../public/images'), staticFileOptions));

// Ensure upload directories exist
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
};

ensureDir(productImagesPath);
ensureDir(proofImagesPath);
ensureDir(path.join(__dirname, '../public/images'));

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
const adminRoutes = require('./routes/admin');

// Optional routes
let feedbackRoutes;
try {
    feedbackRoutes = require('./routes/feedback');
} catch (error) {
    console.log('Feedback routes not available');
}

// Use routes with type checking
if (authRoutes && typeof authRoutes === 'function') app.use('/api/auth', authRoutes);
if (productRoutes && typeof productRoutes === 'function') app.use('/api/products', productRoutes);
if (adminRoutes && typeof adminRoutes === 'function') app.use('/api/admin', adminRoutes);
if (orderRoutes && typeof orderRoutes === 'function') app.use('/api/orders', orderRoutes);
if (cartRoutes && typeof cartRoutes === 'function') app.use('/api/cart', cartRoutes);
if (reviewRoutes && typeof reviewRoutes === 'function') app.use('/api/reviews', reviewRoutes);
if (catalogRoutes && typeof catalogRoutes === 'function') app.use('/api/catalogs', catalogRoutes);
if (userRoutes && typeof userRoutes === 'function') app.use('/api/users', userRoutes);
if (feedbackRoutes && typeof feedbackRoutes === 'function') app.use('/api/feedback', feedbackRoutes);

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