const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header (Bearer Token)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Check if no token found
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify token
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Add user from payload (biasanya berisi id dan role)
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    // First authenticate the token
    authenticateToken(req, res, () => {
        console.log('isAdmin middleware - user:', req.user);
        console.log('isAdmin middleware - token:', req.headers['authorization']);
        
        // Check if user exists and is an admin
        if (!req.user || req.user.role !== 'admin') {
            console.log('Access denied - user role:', req.user?.role);
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        console.log('Admin access granted');
        next();
    });
};


module.exports = {
    authenticateToken,
    isAdmin
};