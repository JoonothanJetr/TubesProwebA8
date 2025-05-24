const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header (Bearer Token)
    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader);
    
    if (!authHeader) {
        console.log('No Authorization header found');
        return res.status(401).json({ error: 'No Authorization header provided' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
        console.log('No token found in Authorization header');
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify token
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token verified successfully:', { userId: user.id, role: user.role });
        
        // Add user from payload
        req.user = user;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Invalid or expired token: ' + err.message });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    // First authenticate the token
    authenticateToken(req, res, () => {
        console.log('isAdmin middleware - user:', req.user);
        console.log('isAdmin middleware - token:', req.headers['authorization']);
        
        // Check if user exists and is an admin
        if (!req.user) {
            console.log('Access denied - no user found in request');
            return res.status(403).json({ error: 'Access denied. User not found.' });
        }
        
        if (req.user.role !== 'admin') {
            console.log('Access denied - user role:', req.user.role);
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        
        console.log('Admin access granted to user:', req.user.id);
        next();
    });
};

module.exports = {
    authenticateToken,
    isAdmin
};