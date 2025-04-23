-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2a$10$3HE7Gkj0iIqD7MI1YoV9/.Rr8S9KZJ3gRMGS0kLiHYWEVQRYVpVGi', 'admin');

-- Insert sample customers (password: password123)
INSERT INTO users (username, email, password, role) VALUES 
('john_doe', 'john@example.com', '$2a$10$KI0LYZFn6JHgI8LQxHLcqOKkU7HCzYF3R8UOL3Wk.4q9kF7O9Wjm6', 'customer'),
('jane_smith', 'jane@example.com', '$2a$10$KI0LYZFn6JHgI8LQxHLcqOKkU7HCzYF3R8UOL3Wk.4q9kF7O9Wjm6', 'customer');

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category) VALUES 
-- Makanan Utama
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran segar', 35000, '/images/nasi-goreng.jpg', 'makanan-utama'),
('Ayam Bakar Madu', 'Ayam bakar dengan bumbu madu special', 45000, '/images/ayam-bakar.jpg', 'makanan-utama'),
('Rendang Sapi', 'Rendang daging sapi dengan bumbu traditional', 50000, '/images/rendang.jpg', 'makanan-utama'),
('Sate Ayam', 'Sate ayam dengan bumbu kacang', 40000, '/images/sate-ayam.jpg', 'makanan-utama'),

-- Makanan Pembuka
('Lumpia Sayur', 'Lumpia isi sayuran segar', 15000, '/images/lumpia.jpg', 'makanan-pembuka'),
('Sop Buntut', 'Sop buntut sapi dengan kuah bening', 25000, '/images/sop-buntut.jpg', 'makanan-pembuka'),
('Gado-gado', 'Sayuran segar dengan bumbu kacang', 20000, '/images/gado-gado.jpg', 'makanan-pembuka'),

-- Makanan Penutup
('Es Teler', 'Es teler dengan alpukat, kelapa muda, dan cincau', 18000, '/images/es-teler.jpg', 'makanan-penutup'),
('Pudding Coklat', 'Pudding coklat dengan saus vanila', 15000, '/images/pudding.jpg', 'makanan-penutup'),
('Pisang Goreng', 'Pisang goreng dengan topping keju dan coklat', 20000, '/images/pisang-goreng.jpg', 'makanan-penutup'),

-- Minuman
('Es Teh Manis', 'Teh manis dingin', 8000, '/images/es-teh.jpg', 'minuman'),
('Jus Alpukat', 'Jus alpukat segar dengan susu', 15000, '/images/jus-alpukat.jpg', 'minuman'),
('Lemon Tea', 'Teh dengan perasan lemon segar', 12000, '/images/lemon-tea.jpg', 'minuman');

-- Insert sample orders
-- Pastikan total_amount sesuai dengan jumlah harga items
-- Note: user_id 1 = admin, 2 = john_doe, 3 = jane_smith
INSERT INTO orders (user_id, total_amount, status, payment_status) VALUES 
(3, 78000, 'completed', 'paid'),      -- Order 1: (2 x 35000) + 8000 = 78000
(2, 105000, 'processing', 'paid'),    -- Order 2: (2 x 45000) + 15000 = 105000
(3, 50000, 'pending', 'unpaid');      -- Order 3: 1 x 50000 = 50000

-- Insert sample order items
-- Pastikan order_id sesuai dengan data di tabel orders
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
-- Order 1: Nasi Goreng (2x) + Es Teh Manis (1x)
(1, 1, 2, 35000),    -- 2 Nasi Goreng Spesial
(1, 11, 1, 8000),    -- 1 Es Teh Manis

-- Order 2: Ayam Bakar (2x) + Lumpia (1x)
(2, 2, 2, 45000),    -- 2 Ayam Bakar Madu
(2, 5, 1, 15000),    -- 1 Lumpia Sayur

-- Order 3: Rendang (1x)
(3, 3, 1, 50000);    -- 1 Rendang Sapi

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES 
(3, 1, 5, 'Nasi gorengnya enak dan porsinya pas!'),
(2, 11, 4, 'Es teh manisnya segar'),
(3, 2, 5, 'Ayam bakarnya empuk dan bumbunya meresap');

-- Insert sample cart items
INSERT INTO cart (user_id, product_id, quantity) VALUES 
(2, 2, 2),    -- 2 Ayam Bakar Madu di keranjang john_doe
(3, 4, 1);    -- 1 Sate Ayam di keranjang jane_smith 