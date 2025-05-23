const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Get dashboard statistics
router.get('/dashboard', auth.isAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get total revenue
        const revenueResult = await client.query(`
            SELECT COALESCE(SUM(total_amount), 0) as total_revenue
            FROM orders
            WHERE payment_status = 'pembayaran sudah dilakukan'
        `);

        // Get order statistics
        const ordersResult = await client.query(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(*) FILTER (WHERE order_status = 'diproses') as pending_orders,
                COUNT(*) FILTER (WHERE order_status = 'selesai') as completed_orders
            FROM orders
        `);

        // Get total products
        const productsResult = await client.query('SELECT COUNT(*) as total_products FROM products');

        // Get total customers
        const customersResult = await client.query(`
            SELECT COUNT(*) as total_customers 
            FROM users 
            WHERE role = 'customer'
        `);

        // Get recent orders
        const recentOrdersResult = await client.query(`
            SELECT o.*, u.username, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        // Get low stock alerts (products with stock < 20)
        const stockAlertsResult = await client.query(`
            SELECT id, name, stock
            FROM products
            WHERE stock < 20
            ORDER BY stock ASC
        `);

        await client.query('COMMIT');

        res.json({
            revenue: revenueResult.rows[0],
            orders: ordersResult.rows[0],
            products: productsResult.rows[0],
            customers: customersResult.rows[0],
            recentOrders: recentOrdersResult.rows,
            stockAlerts: stockAlertsResult.rows
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Get completed orders
router.get('/orders/completed', auth.isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, u.username, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.order_status = 'selesai'
            ORDER BY o.updated_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching completed orders:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get revenue data by date range
router.get('/revenue', auth.isAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { startDate, endDate } = req.query;
        
        // Query untuk mendapatkan pendapatan per hari dalam range tanggal
        const result = await client.query(`
            SELECT 
                DATE(created_at) as date,
                SUM(total_amount) as daily_revenue,
                COUNT(*) as order_count
            FROM orders 
            WHERE payment_status = 'pembayaran sudah dilakukan'
            AND created_at BETWEEN $1 AND $2
            GROUP BY DATE(created_at)
            ORDER BY date
        `, [startDate, endDate]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching revenue data:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
