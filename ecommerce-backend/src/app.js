console.log("--- RUNNING MODIFIED app.js ---"); // Log paling atas

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
    credentials: true,
    exposedHeaders: ['Content-Disposition'] // For file downloads
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk logging setiap request
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.originalUrl}`);
    next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    // Log the error with timestamp and request details
    console.error(`[${new Date().toISOString()}] Error:`, {
        method: req.method,
        url: req.url,
        error: err.stack || err.message,
        user: req.user?.id
    });

    // Handle specific types of errors
    if (err.name === 'UnauthorizedError' || err.status === 401) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication credentials are invalid or missing'
        });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }
    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'File Upload Error',
            message: err.message
        });
    }

    // Default server error
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
        code: err.code
    });
});
const proofsStaticPath = path.join(__dirname, '..', 'uploads', 'proofs');
console.log(`Serving static files from /proofs at path: ${proofsStaticPath}`);
app.use('/proofs', express.static(proofsStaticPath));

// Serve product images 
const productImagesStaticPath = path.join(__dirname, '..', 'uploads', 'products');
console.log(`[Static Files] Serving product images from: ${productImagesStaticPath}`);
app.use('/product_images', express.static(productImagesStaticPath, {
    // Set Cache-Control header
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    },
    // Better error handling
    fallthrough: false, // Return 404 for missing files
    redirect: false // Don't redirect if URL has trailing slash
}));

// Error handler for static files
app.use((err, req, res, next) => {
    if (err.code === 'ENOENT') {
        console.error(`[Static Files] File not found: ${req.url}`);
        res.status(404).json({ error: 'File not found' });
    } else {
        console.error(`[Static Files] Error serving file: ${req.url}`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("--- MODIFIED app.js has finished loading ---"); // Log tambahan di akhir
});