const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function createUser() {
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const customerPassword = await bcrypt.hash('password123', salt);

        // Delete existing users
        await pool.query('TRUNCATE users CASCADE');

        // Create admin user
        await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
            ['admin', 'admin@example.com', adminPassword, 'admin']
        );

        // Create customer user
        await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
            ['john_doe', 'john@example.com', customerPassword, 'customer']
        );

        console.log('Users created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating users:', err);
        process.exit(1);
    }
}

createUser(); 