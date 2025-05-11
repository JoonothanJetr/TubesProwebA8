const { Pool } = require('pg');
require('dotenv').config(); // Pastikan variabel lingkungan terbaca

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'your_password', // Ganti dengan password Anda jika tidak di .env
    port: parseInt(process.env.DB_PORT) || 5432, // Pastikan port adalah angka
    // Tambahkan konfigurasi lain jika ada, seperti ssl
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
