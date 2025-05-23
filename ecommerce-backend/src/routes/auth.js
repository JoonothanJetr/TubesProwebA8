const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Export the router
module.exports = router;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            [username, email, hashedPassword, role || 'customer']
        );

        // Create JWT token
        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        console.log('Received login request:', req.body);
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        console.log('Database query result:', { 
            userFound: user.rows.length > 0,
            userDetails: user.rows[0] ? {
                id: user.rows[0].id,
                email: user.rows[0].email,
                role: user.rows[0].role
            } : null
        });
        
        console.log('User found:', user.rows[0] ? 'Yes' : 'No'); // Debug log

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }        // Verify password
        console.log('Attempting password verification...');
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        console.log('Password verification result:', isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        console.log('Creating JWT token...');        // Create JWT token with a secure default secret
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET || 'jpTv9jZnwp8NDXks2R5vB6MqFgy3UcAe',
            { expiresIn: '1d' }
        );
        console.log('JWT token created successfully');

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                email: user.rows[0].email,
                role: user.rows[0].role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});