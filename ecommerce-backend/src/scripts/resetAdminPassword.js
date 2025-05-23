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

async function resetAdminPassword() {
    try {
        // Generate new hash for 'admin123'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Update admin user password
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING email',
            [hashedPassword, 'admin@example.com']
        );

        if (result.rows.length > 0) {
            console.log('Successfully reset password for:', result.rows[0].email);
            
            // Verify the password works
            const user = await pool.query('SELECT password FROM users WHERE email = $1', ['admin@example.com']);
            const isMatch = await bcrypt.compare('admin123', user.rows[0].password);
            console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');
        } else {
            console.log('Admin user not found');
        }
    } catch (err) {
        console.error('Error resetting password:', err);
    } finally {
        await pool.end();
    }
}

resetAdminPassword();
