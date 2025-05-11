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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware untuk logging setiap request
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.originalUrl}`);
    next();
});

// Serve static files (images)
const proofsStaticPath = path.join(__dirname, '..', 'uploads', 'proofs');
console.log(`Serving static files from /proofs at path: ${proofsStaticPath}`);
app.use('/proofs', express.static(proofsStaticPath));

// Serve product images from uploads/products
// This will make files in 'ecommerce-backend/uploads/products' available under the '/product_images' URL path.
// For example, /product_images/image.jpeg will serve ecommerce-backend/uploads/products/image.jpeg
const productImagesStaticPath = path.join(__dirname, '..', 'uploads', 'products');
console.log(`Serving static files from /product_images at path: ${productImagesStaticPath}`);
app.use('/product_images', express.static(productImagesStaticPath));

// The following line for /products seems to serve the entire 'uploads' directory under /products.
// This might be conflicting or redundant if specific routes for subdirectories like /proofs and /product_images are already defined.
// It is kept commented out to avoid potential conflicts. If you need to serve other files directly from the 'uploads'
// directory under the '/products' path, you might need to re-evaluate this line.
// app.use('/products', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("--- MODIFIED app.js has finished loading ---"); // Log tambahan di akhir
});