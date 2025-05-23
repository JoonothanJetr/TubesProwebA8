-- Hapus tabel jika sudah ada (perhatikan urutan karena foreign key)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

-- Tabel untuk menyimpan informasi pesanan utama
CREATE TABLE orders (    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- atau ON DELETE CASCADE tergantung kebutuhan
    total_amount DECIMAL(12, 2) NOT NULL, -- Tingkatkan presisi jika perlu
    payment_method VARCHAR(50) NOT NULL,
    delivery_address TEXT NULL,
    phone_number VARCHAR(20) NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'diproses' CHECK (order_status IN ('diproses', 'dibatalkan', 'selesai')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'menunggu pembayaran' CHECK (payment_status IN ('menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    desired_completion_date DATE NULL, -- Kolom baru untuk tanggal penyelesaian yang diinginkan
    payment_proof_url VARCHAR(255) NULL,
    admin_comment TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan item-item dalam setiap pesanan
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- Jangan hapus produk jika ada di pesanan
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(12, 2) NOT NULL -- Simpan harga produk pada saat pemesanan
);

-- Opsional: Index untuk mempercepat query umum
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Opsional: Trigger untuk otomatis update kolom updated_at di tabel orders
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();