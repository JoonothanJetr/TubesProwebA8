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

async function updateAdminPassword() {
    try {
        // Generate new hash for password 'admin123'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Update admin password in database
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING email',
            [hashedPassword, 'admin@example.com']
        );

        if (result.rows.length > 0) {
            console.log('Successfully updated password for:', result.rows[0].email);
        } else {
            console.log('Admin user not found');
        }
    } catch (err) {
        console.error('Error updating password:', err);
    } finally {
        process.exit(0);
    }
}

updateAdminPassword();
