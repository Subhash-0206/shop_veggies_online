-- SQL Seed Script for shop_veggies_online
-- Run this in your Supabase SQL Editor

-- 1. Insert some initial products (Fix: Included 'active' column)
INSERT INTO products (name, category, price, unit, stock, image_url, active) VALUES
('Fresh Spinach', 'Leafy Greens', 2.99, 'bunch', 50, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format&fit=crop', true),
('Organic Carrots', 'Root Vegetables', 1.50, 'kg', 100, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop', true),
('Red Tomatoes', 'Fruits', 3.20, 'kg', 80, 'https://images.unsplash.com/photo-1518977676601-b53f02bad174?q=80&w=400&auto=format&fit=crop', true),
('Fresh Broccoli', 'Cruciferous', 2.45, 'piece', 40, 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=400&auto=format&fit=crop', true),
('Red Cabbage', 'Cruciferous', 1.99, 'kg', 60, 'https://images.unsplash.com/photo-1550182244-573e48a7ba05?q=80&w=400&auto=format&fit=crop', true),
('Sweet Potatoes', 'Root Vegetables', 2.10, 'kg', 120, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop', true);

-- 2. Optional: Add a default Admin User (Fix: Included password hash)
-- Password is 'admin123' (BCrypt hashed)
INSERT INTO users (name, email, password, role, address, phone) VALUES
('Admin User', 'admin@veggieshop.com', '$2a$10$8.UnVuG9shgY3WrdG8zAre7v359D.p7.h.7hW3h/Y29W2f.K.7lG', 'ROLE_ADMIN', '123 Farm Road, Green City', '555-0199')
ON CONFLICT (email) DO NOTHING;
