-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2a$10$3HE7Gkj0iIqD7MI1YoV9/.Rr8S9KZJ3gRMGS0kLiHYWEVQRYVpVGi', 'admin');

-- Insert sample customers (password: password123)
INSERT INTO users (username, email, password, role) VALUES 
('john_doe', 'john@example.com', '$2a$10$KI0LYZFn6JHgI8LQxHLcqOKkU7HCzYF3R8UOL3Wk.4q9kF7O9Wjm6', 'customer'),
('jane_smith', 'jane@example.com', '$2a$10$KI0LYZFn6JHgI8LQxHLcqOKkU7HCzYF3R8UOL3Wk.4q9kF7O9Wjm6', 'customer');

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock) VALUES 
('Nasi Kotak Ayam Goreng', 'Nasi putih dengan ayam goreng, sayur, dan sambal', 25000, 'https://example.com/nasi-kotak-1.jpg', 'Nasi Kotak', 100),
('Nasi Kotak Rendang', 'Nasi putih dengan rendang sapi, sayur, dan sambal', 35000, 'https://example.com/nasi-kotak-2.jpg', 'Nasi Kotak', 75),
('Tumpeng Mini', 'Tumpeng mini untuk 5 orang dengan lauk lengkap', 150000, 'https://example.com/tumpeng-1.jpg', 'Tumpeng', 20),
('Snack Box A', 'Berisi 3 macam snack dan air mineral', 15000, 'https://example.com/snack-1.jpg', 'Snack Box', 200),
('Snack Box B', 'Berisi 5 macam snack dan air mineral', 25000, 'https://example.com/snack-2.jpg', 'Snack Box', 150);

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, status, payment_status) VALUES 
(2, 75000, 'completed', 'paid'),
(3, 165000, 'processing', 'paid'),
(2, 45000, 'pending', 'unpaid');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 2, 25000),
(1, 4, 1, 25000),
(2, 3, 1, 150000),
(2, 4, 1, 15000),
(3, 1, 1, 25000),
(3, 4, 2, 15000);

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES 
(2, 1, 5, 'Nasi kotak yang enak dan porsinya pas!'),
(2, 4, 4, 'Snack box-nya berisi makanan yang berkualitas'),
(3, 3, 5, 'Tumpeng mini-nya cantik dan rasanya enak sekali');

-- Insert sample cart items
INSERT INTO cart (user_id, product_id, quantity) VALUES 
(3, 2, 2),
(3, 4, 1); 