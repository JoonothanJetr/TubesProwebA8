const express = require('express');
const router = express.Router(); // Corrected: router instead of ruter
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan direktori uploads/proofs ada
const proofUploadDir = path.join(__dirname, '../../uploads/proofs');
if (!fs.existsSync(proofUploadDir)) {
    fs.mkdirSync(proofUploadDir, { recursive: true });
}

// Konfigurasi Multer untuk upload bukti pembayaran
const proofStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, proofUploadDir); // Simpan di folder uploads/proofs
    },
    filename: function (req, file, cb) {
        // Buat nama file unik: timestamp-originalname
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const fileFilter = (req, file, cb) => {
    // Hanya terima file gambar
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPEG, PNG, JPG) yang diizinkan!'), false);
    }
};

const uploadProof = multer({ storage: proofStorage, fileFilter: fileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // Limit 5MB

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'catering_ecommerce',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// GET /api/orders/sales-data - Fetch aggregated sales data (Admin only)
router.get('/sales-data', auth.isAdmin, async (req, res) => {
    try {
        // Example: Aggregate daily sales total. Adjust SQL as needed.
        const query = `
            SELECT 
                DATE(order_date) as date, 
                SUM(total_amount) as totalsales
            FROM orders
            WHERE order_status = 'selesai' -- Consider only completed orders for sales
            GROUP BY DATE(order_date)
            ORDER BY DATE(order_date) ASC;
        `;
        const result = await pool.query(query);
          // Format data for chart.js (labels and data points)
        const labels = result.rows.map(row => new Date(row.date).toLocaleDateString());
        const data = result.rows.map(row => parseFloat(row.totalsales));
        
        // Debug the output
        console.log("Sales data being sent:", { 
            labels, 
            data,
            rowsFromDB: result.rows
        });
        
        res.json({
            labels,
            datasets: [
                {
                    label: 'Sales Over Time',
                    data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        });
    } catch (err) {
        console.error('Sales Data Error:', err);
        res.status(500).json({ error: 'Server error retrieving sales data' });
    }
});

// Get all orders (Admin) or user's orders (Customer)
router.get('/', auth.authenticateToken, async (req, res) => {
    try {
        let baseQuery;
        let queryParams = [];
        let paramIndex = 1;

        // Ambil filter dari query string
        const { startDate, endDate, paymentStatus, orderStatus } = req.query;

        let whereClauses = [];

        if (req.user.role === 'admin') {
            // Admin: query dasar join dengan users
            baseQuery = `
                SELECT o.*, u.username, u.email 
                FROM orders o 
                JOIN users u ON o.user_id = u.id
            `;        } else {
            // Customer: query dasar hanya untuk order milik user
            baseQuery = `SELECT * FROM orders o`;
            whereClauses.push(`o.user_id = $${paramIndex++}`);
            queryParams.push(req.user.id);
        }

        // Tambahkan filter ke WHERE clause
        if (startDate) {
            // Asumsi endDate adalah akhir hari jika hanya startDate yang ada
            const effectiveEndDate = endDate || startDate;
            // Tambahkan 1 hari ke endDate untuk membuatnya inklusif sampai akhir hari
            const endDatePlusOne = new Date(effectiveEndDate);
            endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
            
            whereClauses.push(`o.order_date >= $${paramIndex++}`);
            queryParams.push(startDate); 
            whereClauses.push(`o.order_date < $${paramIndex++}`);
            queryParams.push(endDatePlusOne.toISOString().split('T')[0]); // Format YYYY-MM-DD
        } else if (endDate) { 
             // Jika hanya endDate, filter sampai akhir hari endDate
             const endDatePlusOne = new Date(endDate);
             endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
             whereClauses.push(`o.order_date < $${paramIndex++}`);
             queryParams.push(endDatePlusOne.toISOString().split('T')[0]);
        }
        
        if (paymentStatus) {
            whereClauses.push(`o.payment_status = $${paramIndex++}`);
            queryParams.push(paymentStatus);
        }
        if (orderStatus) {
            whereClauses.push(`o.order_status = $${paramIndex++}`);
            queryParams.push(orderStatus);
        }

        // Gabungkan query
        let finalQuery = baseQuery;
        if (whereClauses.length > 0) {
            finalQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        finalQuery += ` ORDER BY o.created_at DESC`; // Urutkan hasil

        // Debugging query
        console.log("Executing query:", finalQuery);
        console.log("With params:", queryParams);

        // Eksekusi query
        const result = await pool.query(finalQuery, queryParams);
        
        res.json(result.rows);

    } catch (err) {
        console.error('Get Orders Error:', err);
        res.status(500).json({ error: 'Server error retrieving orders' });
    }
});

// Get order details
router.get('/:id', auth.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get order
        const orderResult = await pool.query(
            `SELECT o.*, u.username, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = $1`,
            [id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if user has permission to view this order
        if (req.user.role !== 'admin' && orderResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
          // Get order items
        const itemsResult = await pool.query(
            `SELECT oi.*, p.name, p.image_url, cat.name AS category_name
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             LEFT JOIN categories cat ON p.category_id = cat.id
             WHERE oi.order_id = $1`,
            [id]
        );
        
        const order = orderResult.rows[0];
        order.items = itemsResult.rows.map(item => {
            // Format image URL consistently like in products.js
            let imageUrl = item.image_url || '';
            
            // If image_url starts with '/images/', this is from seed data
            if (imageUrl.startsWith('/images/')) {
                // Keep as is, the frontend will handle it
            } 
            // If image_url already includes the uploads/products path, don't modify it
            else if (imageUrl.includes('uploads/products/')) {
                // Already correctly formatted
            }
            // If image_url is just a filename (from upload), add the proper path
            else if (!imageUrl.startsWith('/') && !imageUrl.includes('http')) {
                imageUrl = `uploads/products/${imageUrl}`;
            }
            
            return {
                ...item,
                image_url: imageUrl
            };
        });
        
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create order from cart
router.post('/', auth.authenticateToken, async (req, res) => {
    const { paymentMethod, items, totalAmount } = req.body;
    const userId = req.user.id; // Didapatkan dari middleware auth

    // Validasi input dasar
    if (!paymentMethod || !items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ error: 'Data pesanan tidak lengkap.' });
    }

    const client = await pool.connect(); // Dapatkan koneksi dari pool untuk transaksi

    try {
        await client.query('BEGIN'); // Mulai transaksi

        // 1. Buat entri di tabel 'orders'
        const orderInsertQuery = `
            INSERT INTO orders (user_id, total_amount, payment_method)
            VALUES ($1, $2, $3)
            RETURNING id, order_status, payment_status, order_date;
        `;
        const orderRes = await client.query(orderInsertQuery, [userId, totalAmount, paymentMethod]);
        const newOrderId = orderRes.rows[0].id;
        const newOrder = orderRes.rows[0];

        // 2. Loop melalui item, periksa stok, buat entri 'order_items', kurangi stok
        for (const item of items) {
            // 2a. Periksa stok produk (lagi, untuk keamanan saat transaksi)
            const stockCheckRes = await client.query('SELECT stock FROM products WHERE id = $1 FOR UPDATE', [item.product_id]);
            // 'FOR UPDATE' mengunci baris produk untuk mencegah race condition stok

            if (stockCheckRes.rows.length === 0) {
                throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan.`);
            }
            const currentStock = stockCheckRes.rows[0].stock;
            if (currentStock < item.quantity) {
                throw new Error(`Stok tidak mencukupi untuk produk ID ${item.product_id}. Sisa: ${currentStock}`);
            }

            // 2b. Buat entri di 'order_items'
            const orderItemInsertQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4);
            `;
            await client.query(orderItemInsertQuery, [newOrderId, item.product_id, item.quantity, item.price]);

            // 2c. Kurangi stok di tabel 'products'
            const stockUpdateQuery = `
                UPDATE products SET stock = stock - $1 WHERE id = $2;
            `;
            await client.query(stockUpdateQuery, [item.quantity, item.product_id]);
        }

        // 3. Hapus item dari keranjang pengguna
        const deleteCartQuery = `DELETE FROM cart WHERE user_id = $1;`;
        await client.query(deleteCartQuery, [userId]);

        await client.query('COMMIT'); // Selesaikan transaksi jika semua berhasil

        res.status(201).json({ 
            message: 'Pesanan berhasil dibuat!', 
            order: newOrder // Kirim detail order yang baru dibuat
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Batalkan transaksi jika ada error
        console.error('Transaction Error:', err);
        res.status(500).json({ error: err.message || 'Gagal memproses pesanan.' }); // Kirim pesan error
    } finally {
        client.release(); // Kembalikan koneksi ke pool
    }
});

// === BARU: Create order with payment proof ===
router.post('/with-proof', auth.authenticateToken, uploadProof.single('paymentProof'), async (req, res) => {
    const {
        paymentMethod,
        items: itemsString, // items akan datang sebagai JSON string dari FormData
        totalAmount,
        desiredCompletionDate
    } = req.body;
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ error: 'Bukti pembayaran wajib diunggah.' });
    }

    let items;
    try {
        items = JSON.parse(itemsString);
    } catch (e) {
        // Hapus file yang mungkin sudah terunggah jika parsing JSON gagal
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting orphaned file after JSON parse error:', unlinkErr);
            });
        }
        return res.status(400).json({ error: 'Format data item tidak valid.' });
    }

    if (!paymentMethod || !items || items.length === 0 || !totalAmount || !desiredCompletionDate) {
        // Hapus file yang mungkin sudah terunggah jika validasi gagal
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting orphaned file after validation error:', unlinkErr);
            });
        }
        return res.status(400).json({ error: 'Data pesanan tidak lengkap.' });
    }

    const paymentProofUrl = `/proofs/${req.file.filename}`;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderInsertQuery = `
            INSERT INTO orders (user_id, total_amount, payment_method, desired_completion_date, payment_proof_url, order_status, payment_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, order_status, payment_status, order_date, created_at, payment_proof_url, desired_completion_date;
        `;
        const orderRes = await client.query(orderInsertQuery, [
            userId,
            totalAmount,
            paymentMethod,
            desiredCompletionDate,
            paymentProofUrl,
            'diproses',
            'pembayaran sudah dilakukan'
        ]);
        const newOrderId = orderRes.rows[0].id;
        const newOrder = orderRes.rows[0];

        for (const item of items) {
            if (!item.product_id || typeof item.quantity === 'undefined' || typeof item.price === 'undefined') {
                throw new Error('Data item produk tidak lengkap (product_id, quantity, atau price hilang).');
            }
            const orderItemInsertQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4);
            `;
            await client.query(orderItemInsertQuery, [newOrderId, item.product_id, item.quantity, item.price]);
        }

        const deleteCartQuery = `DELETE FROM cart WHERE user_id = $1;`;
        await client.query(deleteCartQuery, [userId]);

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Pesanan berhasil dibuat dan bukti pembayaran diterima!',
            order: newOrder
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Order Creation with Proof Error:', err.message);
        // Hapus file yang sudah terupload jika terjadi error database
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting orphaned file after DB error:', unlinkErr);
            });
        }
        res.status(500).json({ error: err.message || 'Gagal memproses pesanan dengan bukti pembayaran.' });
    } finally {
        client.release();
    }
});

// Update order status (Admin only)
router.put('/:id/status', auth.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['diproses', 'dibatalkan', 'selesai'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update payment status
router.put('/:id/payment', auth.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        
        // Validate payment status
        const validStatuses = ['unpaid', 'paid', 'failed'];
        if (!validStatuses.includes(payment_status)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }
        
        // Get order
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if user has permission to update this order
        if (req.user.role !== 'admin' && orderResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
            [payment_status, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel order (Customer only)
router.post('/:id/cancel', auth.authenticateToken, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(403).json({ error: 'Admins cannot cancel orders this way' });
        }
        
        const { id } = req.params;
        
        // Get order
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if order can be cancelled
        const order = orderResult.rows[0];
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Only pending orders can be cancelled' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *',
            ['dibatalkan', id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// === Endpoint Upload Bukti Pembayaran ===
router.put('/:id/upload-proof', auth.authenticateToken, uploadProof.single('paymentProof'), async (req, res) => {
    const { id: orderId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ error: 'File bukti pembayaran diperlukan.' });
    }

    // Normalisasi path untuk disimpan di DB dan diakses dari URL
    // Simpan path relatif terhadap direktori uploads
    const relativeFilePath = path.join('proofs', req.file.filename).replace(/\//g, '/'); // Ganti backslash jadi slash

    try {
        // 1. Ambil data order untuk validasi
        const orderRes = await pool.query('SELECT user_id, payment_method, order_status, payment_status FROM orders WHERE id = $1', [orderId]);

        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }

        const order = orderRes.rows[0];

        // 2. Validasi kepemilikan order
        if (order.user_id !== userId) {
            return res.status(403).json({ error: 'Anda tidak memiliki izin untuk mengupload bukti bayar pesanan ini.' });
        }

        // 3. Validasi status dan metode pembayaran
        if (order.payment_method === 'cod') {
             return res.status(400).json({ error: 'Metode COD tidak memerlukan upload bukti pembayaran.' });
        }
        if (order.payment_status !== 'menunggu pembayaran' || order.order_status !== 'diproses') {
             return res.status(400).json({ error: 'Tidak dapat mengupload bukti pembayaran untuk status pesanan/pembayaran saat ini.' });
        }

        // 4. Update database (HANYA URL BUKTI BAYAR)
        const updateQuery = `
            UPDATE orders 
            SET payment_proof_url = $1 
            WHERE id = $2
            RETURNING *; -- Kembalikan data order yang sudah diupdate
        `;
        // Simpan path yang bisa diakses via URL statis nantinya (tanpa ../..)
        const proofUrlForDb = `/proofs/${req.file.filename}`;
        const updatedOrderRes = await pool.query(updateQuery, [proofUrlForDb, orderId]);

        res.json({ 
            message: 'Bukti pembayaran berhasil diupload dan sedang menunggu verifikasi admin.', 
            order: updatedOrderRes.rows[0] 
        });

    } catch (err) {
        console.error('Upload Proof Error:', err);
        // Hapus file yang sudah terupload jika terjadi error database? Atau biarkan admin yg handle?
        // fs.unlink(req.file.path, (unlinkErr) => { ... });
        res.status(500).json({ error: 'Gagal mengupload bukti pembayaran.' });
    } 
});

// --- Endpoint Admin (Update Status, dll. bisa dipisah ke admin.js jika lebih rapi) ---
// Contoh: Update status order dan payment (ADMIN ONLY)
router.put('/:id/admin/status', auth.authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak. Hanya admin.' });
    }

    const { id } = req.params;
    const { order_status, payment_status, admin_comment } = req.body;

    // Validasi input (contoh sederhana)
    const validOrderStatuses = ['diproses', 'dibatalkan', 'selesai'];
    const validPaymentStatuses = ['menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan'];

    if (order_status && !validOrderStatuses.includes(order_status)) {
        return res.status(400).json({ error: 'Status pesanan tidak valid.' });
    }
    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({ error: 'Status pembayaran tidak valid.' });
    }

    // Buat query update dinamis berdasarkan field yang diberikan
    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;

    if (order_status) {
        updateFields.push(`order_status = $${paramIndex++}`);
        queryParams.push(order_status);
    }
    if (payment_status) {
        updateFields.push(`payment_status = $${paramIndex++}`);
        queryParams.push(payment_status);
    }
     if (admin_comment !== undefined) { // Allow empty string for comment
        updateFields.push(`admin_comment = $${paramIndex++}`);
        queryParams.push(admin_comment);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'Tidak ada field status atau komentar yang diberikan untuk diupdate.' });
    }

    // Tambahkan ID order sebagai parameter terakhir
    queryParams.push(id);
    const finalParamIndex = paramIndex;

    const updateQuery = `
        UPDATE orders 
        SET ${updateFields.join(', ')}
        WHERE id = $${finalParamIndex}
        RETURNING *;
    `;

    try {
        const result = await pool.query(updateQuery, queryParams);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }
        res.json({ message: 'Status pesanan berhasil diperbarui.', order: result.rows[0] });
    } catch (err) {
        console.error('Admin Update Status Error:', err);
        res.status(500).json({ error: 'Gagal memperbarui status pesanan.' });
    }
});

// Get completed orders
router.get('/status/completed', auth.authenticateToken, async (req, res) => {
    try {
        let query;
        const queryParams = [];
        
        if (req.user.role === 'admin') {
            // Admin can see all completed orders
            query = `
                SELECT o.*, u.username, u.email 
                FROM orders o 
                JOIN users u ON o.user_id = u.id
                WHERE o.order_status = 'selesai'
                ORDER BY o.created_at DESC
            `;
        } else {
            // Regular users can only see their own completed orders
            query = `
                SELECT o.* 
                FROM orders o
                WHERE o.user_id = $1 AND o.order_status = 'selesai'
                ORDER BY o.created_at DESC
            `;
            queryParams.push(req.user.id);
        }
        
        // Debugging query
        console.log("Executing completed orders query:", query);
        console.log("With params:", queryParams);
        
        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Get Completed Orders Error:', err);
        res.status(500).json({ error: 'Server error retrieving completed orders' });
    }
});

module.exports = router;