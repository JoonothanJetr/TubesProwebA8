const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function initDb() {
    const client = await pool.connect();
    try {        // Drop existing tables
        await client.query('DROP TABLE IF EXISTS reviews CASCADE');
        await client.query('DROP TABLE IF EXISTS order_items CASCADE');
        await client.query('DROP TABLE IF EXISTS orders CASCADE');
        await client.query('DROP TABLE IF EXISTS cart CASCADE');
        await client.query('DROP TABLE IF EXISTS products CASCADE');
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        await client.query('DROP TABLE IF EXISTS feedback CASCADE');
        console.log('Existing tables dropped successfully');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('Schema created successfully');

        // Read and execute seed.sql
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedSql);
        console.log('Seed data inserted successfully');

    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

initDb().catch(console.error);
