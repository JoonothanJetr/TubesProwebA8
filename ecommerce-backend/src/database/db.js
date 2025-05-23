const { Pool } = require('pg');
require('dotenv').config(); // Pastikan variabel lingkungan terbaca

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'postgres', // Default password for PostgreSQL
    port: parseInt(process.env.DB_PORT) || 5432,
    // Add SSL config for production if needed
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
