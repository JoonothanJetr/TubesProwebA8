const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header (Bearer Token)
    const authHeader = req.header('Authorization');
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Extract token from "Bearer <token>"
        token = authHeader.split(' ')[1];
    } 
    // else {
    //     // Alternatif: coba cek header x-auth-token (jika masih digunakan di tempat lain)
    //     // token = req.header('x-auth-token'); 
    // }

    // Check if no token found
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Add user from payload (biasanya berisi id dan role)
        req.user = decoded; // decoded akan berisi { id: ..., role: ... }
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;

        // Check if user is admin
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
        }
    } catch (err) {
        console.error('Admin authentication error:', err.message);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};


module.exports = {
    authenticateToken,
    isAdmin
};