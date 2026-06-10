-- ============================================================
-- SmartPOS Seed Data
-- Run this in Supabase SQL Editor (SQL Editor runs with
-- superuser privileges and bypasses RLS)
-- ============================================================

-- 1. PROFILES (links to auth.users by email)
-- -----------------------------------------------------------
-- Creates a profile row for each auth user found by email.
-- If a demo user doesn't exist yet in auth.users, create them
-- first via Sign Up in your Supabase Auth dashboard, then
-- re-run this script.
INSERT INTO profiles (id, name, email, phone, role, is_active)
SELECT id, 'Naveya Admin', email, '9876543210', 'admin', true
FROM auth.users WHERE email = 'admin@smartpos.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, name, email, phone, role, is_active)
SELECT id, 'Karthik', email, '9876543211', 'manager', true
FROM auth.users WHERE email = 'manager@smartpos.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, name, email, phone, role, is_active)
SELECT id, 'Meena', email, '9876543212', 'cashier', true
FROM auth.users WHERE email = 'cashier1@smartpos.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, name, email, phone, role, is_active)
SELECT id, 'Arun', email, '9876543213', 'cashier', true
FROM auth.users WHERE email = 'cashier2@smartpos.com'
ON CONFLICT (id) DO NOTHING;


-- 2. CATEGORIES
-- -----------------------------------------------------------
INSERT INTO categories (id, name, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Groceries',   'Daily grocery and food items'),
  ('a0000000-0000-0000-0000-000000000002', 'Beverages',   'Drinks and beverages'),
  ('a0000000-0000-0000-0000-000000000003', 'Electronics', 'Electronic accessories and devices'),
  ('a0000000-0000-0000-0000-000000000004', 'Stationery',  'Office and school supplies'),
  ('a0000000-0000-0000-0000-000000000005', 'Fashion',     'Clothing and accessories')
ON CONFLICT (id) DO NOTHING;


-- 3. PRODUCTS
-- -----------------------------------------------------------
INSERT INTO products (id, name, description, sku, barcode, category_id, brand, purchase_price, selling_price, stock_quantity, min_stock_level, gst_percentage, unit) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Aavin Milk 500ml',     'Fresh toned milk 500ml pack',  'SKU001', '890100000001', 'a0000000-0000-0000-0000-000000000002', 'Aavin',   20.00,  28.00,  150, 20, 12, 'pcs'),
  ('b0000000-0000-0000-0000-000000000002', 'Coca Cola 750ml',      'Chilled Coca Cola 750ml PET',  'SKU002', '890100000002', 'a0000000-0000-0000-0000-000000000002', 'Coca Cola', 32.00, 45.00,  80,  15, 12, 'pcs'),
  ('b0000000-0000-0000-0000-000000000003', 'Dairy Milk Silk',      'Cadbury Dairy Milk Silk 60g',  'SKU003', '890100000003', 'a0000000-0000-0000-0000-000000000001', 'Cadbury', 130.00, 175.00, 60,  10,  5, 'pcs'),
  ('b0000000-0000-0000-0000-000000000004', 'Lux Soap',             'Lux Soap 100g pack',           'SKU004', '890100000004', 'a0000000-0000-0000-0000-000000000001', 'Lux',     30.00,  42.00,  120, 20,  5, 'pcs'),
  ('b0000000-0000-0000-0000-000000000005', 'India Gate Rice 5kg',  'India Gate Basmati Rice 5kg',  'SKU005', '890100000005', 'a0000000-0000-0000-0000-000000000001', 'India Gate', 350.00, 450.00, 35, 10,  5, 'bag'),
  ('b0000000-0000-0000-0000-000000000006', 'Classmate Notebook',   'Classmate Long Notebook 172pg','SKU006', '890100000006', 'a0000000-0000-0000-0000-000000000004', 'Classmate', 42.00, 60.00, 200, 30,  5, 'pcs'),
  ('b0000000-0000-0000-0000-000000000007', 'Reynolds Pen',         'Reynolds Ball Pen 0.7mm',      'SKU007', '890100000007', 'a0000000-0000-0000-0000-000000000004', 'Reynolds', 10.00, 15.00,  500, 50,  5, 'pcs'),
  ('b0000000-0000-0000-0000-000000000008', 'USB Keyboard',         'HP USB Wired Keyboard',        'SKU008', '890100000008', 'a0000000-0000-0000-0000-000000000003', 'HP',      520.00, 699.00,  25, 30, 18, 'pcs'),
  ('b0000000-0000-0000-0000-000000000009', 'Wireless Mouse',       'Logitech Wireless Mouse',      'SKU009', '890100000009', 'a0000000-0000-0000-0000-000000000003', 'Logitech',670.00, 899.00,  18, 20, 18, 'pcs'),
  ('b0000000-0000-0000-0000-000000000010', 'Mens T-Shirt',         'Premium Cotton T-Shirt',       'SKU010', '890100000010', 'a0000000-0000-0000-0000-000000000005', 'Nike',    440.00, 599.00,  40, 10,  5, 'pcs'),
  ('b0000000-0000-0000-0000-000000000011', 'Sprite 600ml',         'Sprite Lemon Drink 600ml',     'SKU011', '890100000011', 'a0000000-0000-0000-0000-000000000002', 'Sprite',  28.00,  40.00,  95, 15, 12, 'pcs'),
  ('b0000000-0000-0000-0000-000000000012', 'Lays Chips',           'Lays Classic Salted 52g',      'SKU012', '890100000012', 'a0000000-0000-0000-0000-000000000001', 'Lays',    15.00,  20.00,  200, 30,  5, 'pcs'),
  ('b0000000-0000-0000-0000-000000000013', 'Pencil Box',           'Camlin Pencil Box',            'SKU013', '890100000013', 'a0000000-0000-0000-0000-000000000004', 'Camlin',  85.00, 120.00,  45, 10,  5, 'pcs'),
  ('b0000000-0000-0000-0000-000000000014', 'Bluetooth Speaker',    'Boat Stone 1200 Speaker',      'SKU014', '890100000014', 'a0000000-0000-0000-0000-000000000003', 'Boat',   1200.00,1799.00,  12, 10, 18, 'pcs'),
  ('b0000000-0000-0000-0000-000000000015', 'Womens Kurta',         'Cotton Printed Kurta',         'SKU015', '890100000015', 'a0000000-0000-0000-0000-000000000005', 'Libas',  650.00, 899.00,  25,  8,  5, 'pcs')
ON CONFLICT (id) DO NOTHING;


-- 4. CUSTOMERS
-- -----------------------------------------------------------
INSERT INTO customers (id, name, phone, email, address, loyalty_points) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Arjun Kumar',  '9876543210', 'arjun@email.com',   'Chennai',    520),
  ('c0000000-0000-0000-0000-000000000002', 'Priya S',      '9876543211', 'priya@email.com',   'Coimbatore', 310),
  ('c0000000-0000-0000-0000-000000000003', 'Rahul M',      '9876543212', 'rahul@email.com',   'Bangalore',  180),
  ('c0000000-0000-0000-0000-000000000004', 'Kavya R',      '9876543213', 'kavya@email.com',   'Hyderabad',   95),
  ('c0000000-0000-0000-0000-000000000005', 'Sanjay P',     '9876543214', 'sanjay@email.com',  'Madurai',    245),
  ('c0000000-0000-0000-0000-000000000006', 'Deepa K',      '9876543215', 'deepa@email.com',   'Chennai',    410),
  ('c0000000-0000-0000-0000-000000000007', 'Venkat R',     '9876543216', 'venkat@email.com',  'Bangalore',  160),
  ('c0000000-0000-0000-0000-000000000008', 'Anita Sharma', '9876543217', 'anita@email.com',   'Delhi',       75)
ON CONFLICT (id) DO NOTHING;


-- 5. SUPPLIERS
-- -----------------------------------------------------------
INSERT INTO suppliers (id, name, phone, email, address, gst_number) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Aavin Distributor',    '9840011111', 'info@aavindistributor.com',  'Chennai',   '33AABC1234D1Z5'),
  ('d0000000-0000-0000-0000-000000000002', 'Coca Cola India',      '9840022222', 'orders@cocacola.in',         'Mumbai',    '27AABC5678E1Z2'),
  ('d0000000-0000-0000-0000-000000000003', 'IT World Suppliers',   '9840033333', 'sales@itworld.in',           'Bangalore', '29AABC9101F1Z3'),
  ('d0000000-0000-0000-0000-000000000004', 'Classmate Wholesale',  '9840044444', 'bulk@classmate.in',          'Pune',      '27AABC1121G1Z4'),
  ('d0000000-0000-0000-0000-000000000005', 'Fashion Hub Traders',  '9840055555', 'contact@fashionhub.in',      'Delhi',     '07AABC3141H1Z5'),
  ('d0000000-0000-0000-0000-000000000006', 'Boat Electronics',     '9840066666', 'b2b@boat.in',                'Mumbai',    '27AABC4151H1Z6')
ON CONFLICT (id) DO NOTHING;


-- 6. SALES + SALE_ITEMS + STOCK_MOVEMENTS
-- -----------------------------------------------------------
-- We need at least one profile user_id for the sales.
-- Pick the first profile found, or use a known auth user.
DO $$
DECLARE
  admin_id UUID;
  cashier_id UUID;
  manager_id UUID;
  sale_id_1 UUID := gen_random_uuid();
  sale_id_2 UUID := gen_random_uuid();
  sale_id_3 UUID := gen_random_uuid();
  sale_id_4 UUID := gen_random_uuid();
  sale_id_5 UUID := gen_random_uuid();
  sale_id_6 UUID := gen_random_uuid();
  sale_id_7 UUID := gen_random_uuid();
  sale_id_8 UUID := gen_random_uuid();
BEGIN
  -- Get actual profile IDs from the database
  SELECT id INTO admin_id   FROM profiles WHERE email = 'admin@smartpos.com'   LIMIT 1;
  SELECT id INTO cashier_id FROM profiles WHERE email = 'cashier1@smartpos.com' LIMIT 1;
  SELECT id INTO manager_id FROM profiles WHERE email = 'manager@smartpos.com'  LIMIT 1;

  -- Fallback: if no profile found, create a placeholder (won't reference auth.users)
  IF admin_id IS NULL THEN
    admin_id := '00000000-0000-0000-0000-000000000001';
  END IF;
  IF cashier_id IS NULL THEN
    cashier_id := '00000000-0000-0000-0000-000000000002';
  END IF;
  IF manager_id IS NULL THEN
    manager_id := '00000000-0000-0000-0000-000000000003';
  END IF;

  -- ===== SALE 1 =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_1, 'INV20260001', 'c0000000-0000-0000-0000-000000000001', admin_id,
          548.00, 16.00, 41.70, 573.70, 'upi', 'completed', 'Regular purchase', '2026-06-08T10:30:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_1, 'b0000000-0000-0000-0000-000000000001', 'Aavin Milk 500ml',   5,  28.00, 140.00, 16.80),
    (sale_id_1, 'b0000000-0000-0000-0000-000000000004', 'Lux Soap',           2,  42.00,  84.00,  4.20),
    (sale_id_1, 'b0000000-0000-0000-0000-000000000003', 'Dairy Milk Silk',    1, 175.00, 175.00,  8.75),
    (sale_id_1, 'b0000000-0000-0000-0000-000000000007', 'Reynolds Pen',       3,  15.00,  45.00,  2.25),
    (sale_id_1, 'b0000000-0000-0000-0000-000000000006', 'Classmate Notebook', 1,  60.00,  60.00,  3.00);

  -- Stock out
  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES
    ('b0000000-0000-0000-0000-000000000001', 'out', 5,  'sale', 'INV20260001', admin_id),
    ('b0000000-0000-0000-0000-000000000004', 'out', 2,  'sale', 'INV20260001', admin_id),
    ('b0000000-0000-0000-0000-000000000003', 'out', 1,  'sale', 'INV20260001', admin_id),
    ('b0000000-0000-0000-0000-000000000007', 'out', 3,  'sale', 'INV20260001', admin_id),
    ('b0000000-0000-0000-0000-000000000006', 'out', 1,  'sale', 'INV20260001', admin_id);

  -- ===== SALE 2 =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_2, 'INV20260002', 'c0000000-0000-0000-0000-000000000002', cashier_id,
          1245.00, 25.00, 97.40, 1317.40, 'cash', 'completed', 'Bulk grocery order', '2026-06-08T12:15:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_2, 'b0000000-0000-0000-0000-000000000005', 'India Gate Rice 5kg', 2, 450.00, 900.00, 45.00),
    (sale_id_2, 'b0000000-0000-0000-0000-000000000001', 'Aavin Milk 500ml',    2,  28.00,  56.00,  6.72),
    (sale_id_2, 'b0000000-0000-0000-0000-000000000002', 'Coca Cola 750ml',     3,  45.00, 135.00, 16.20),
    (sale_id_2, 'b0000000-0000-0000-0000-000000000007', 'Reynolds Pen',       10,  15.00, 150.00,  7.50);

  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES
    ('b0000000-0000-0000-0000-000000000005', 'out', 2,  'sale', 'INV20260002', cashier_id),
    ('b0000000-0000-0000-0000-000000000001', 'out', 2,  'sale', 'INV20260002', cashier_id),
    ('b0000000-0000-0000-0000-000000000002', 'out', 3,  'sale', 'INV20260002', cashier_id),
    ('b0000000-0000-0000-0000-000000000007', 'out', 10, 'sale', 'INV20260002', cashier_id);

  -- ===== SALE 3 =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_3, 'INV20260003', 'c0000000-0000-0000-0000-000000000003', cashier_id,
          1598.00, 0.00,  287.64, 1885.64, 'card', 'completed', 'Electronics purchase', '2026-06-08T14:45:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_3, 'b0000000-0000-0000-0000-000000000008', 'USB Keyboard',      1, 699.00,  699.00, 125.82),
    (sale_id_3, 'b0000000-0000-0000-0000-000000000009', 'Wireless Mouse',    1, 899.00,  899.00, 161.82);

  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES
    ('b0000000-0000-0000-0000-000000000008', 'out', 1, 'sale', 'INV20260003', cashier_id),
    ('b0000000-0000-0000-0000-000000000009', 'out', 1, 'sale', 'INV20260003', cashier_id);

  -- ===== SALE 4 =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_4, 'INV20260004', NULL, admin_id,
          780.00, 0.00, 60.00, 840.00, 'cash', 'completed', 'Walk-in customer', '2026-06-09T09:00:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_4, 'b0000000-0000-0000-0000-000000000012', 'Lays Chips',        5, 20.00, 100.00,  5.00),
    (sale_id_4, 'b0000000-0000-0000-0000-000000000011', 'Sprite 600ml',      3, 40.00, 120.00, 14.40),
    (sale_id_4, 'b0000000-0000-0000-0000-000000000004', 'Lux Soap',          5, 42.00, 210.00, 10.50),
    (sale_id_4, 'b0000000-0000-0000-0000-000000000007', 'Reynolds Pen',     10, 15.00, 150.00,  7.50),
    (sale_id_4, 'b0000000-0000-0000-0000-000000000010', 'Mens T-Shirt',      1, 599.00, 599.00, 29.95);

  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES
    ('b0000000-0000-0000-0000-000000000012', 'out', 5,  'sale', 'INV20260004', admin_id),
    ('b0000000-0000-0000-0000-000000000011', 'out', 3,  'sale', 'INV20260004', admin_id),
    ('b0000000-0000-0000-0000-000000000004', 'out', 5,  'sale', 'INV20260004', admin_id),
    ('b0000000-0000-0000-0000-000000000007', 'out', 10, 'sale', 'INV20260004', admin_id),
    ('b0000000-0000-0000-0000-000000000010', 'out', 1,  'sale', 'INV20260004', admin_id);

  -- ===== SALE 5 =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_5, 'INV20260005', 'c0000000-0000-0000-0000-000000000005', manager_id,
          2288.00, 50.00, 97.45, 2335.45, 'upi', 'completed', 'Festival shopping', '2026-06-09T11:20:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_5, 'b0000000-0000-0000-0000-000000000005', 'India Gate Rice 5kg', 1, 450.00, 450.00, 22.50),
    (sale_id_5, 'b0000000-0000-0000-0000-000000000010', 'Mens T-Shirt',        2, 599.00, 599.00, 29.95),
    (sale_id_5, 'b0000000-0000-0000-0000-000000000003', 'Dairy Milk Silk',     2, 175.00, 350.00, 17.50),
    (sale_id_5, 'b0000000-0000-0000-0000-000000000006', 'Classmate Notebook',  2,  60.00, 120.00,  6.00),
    (sale_id_5, 'b0000000-0000-0000-0000-000000000007', 'Reynolds Pen',        5,  15.00,  75.00,  3.75),
    (sale_id_5, 'b0000000-0000-0000-0000-000000000014', 'Bluetooth Speaker',   1,1799.00,1799.00, 323.82);

  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES
    ('b0000000-0000-0000-0000-000000000005', 'out', 1,  'sale', 'INV20260005', manager_id),
    ('b0000000-0000-0000-0000-000000000010', 'out', 2,  'sale', 'INV20260005', manager_id),
    ('b0000000-0000-0000-0000-000000000003', 'out', 2,  'sale', 'INV20260005', manager_id),
    ('b0000000-0000-0000-0000-000000000006', 'out', 2,  'sale', 'INV20260005', manager_id),
    ('b0000000-0000-0000-0000-000000000007', 'out', 5,  'sale', 'INV20260005', manager_id),
    ('b0000000-0000-0000-0000-000000000014', 'out', 1,  'sale', 'INV20260005', manager_id);

  -- ===== SALE 6 =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_6, 'INV20260006', NULL, cashier_id,
          304.00, 0.00, 30.29, 334.29, 'card', 'completed', 'Quick purchase', '2026-06-09T15:30:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_6, 'b0000000-0000-0000-0000-000000000011', 'Sprite 600ml',      2, 40.00,  80.00,  9.60),
    (sale_id_6, 'b0000000-0000-0000-0000-000000000012', 'Lays Chips',        5, 20.00, 100.00,  5.00),
    (sale_id_6, 'b0000000-0000-0000-0000-000000000013', 'Pencil Box',        1,120.00, 120.00,  6.00);

  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES
    ('b0000000-0000-0000-0000-000000000011', 'out', 2, 'sale', 'INV20260006', cashier_id),
    ('b0000000-0000-0000-0000-000000000012', 'out', 5, 'sale', 'INV20260006', cashier_id),
    ('b0000000-0000-0000-0000-000000000013', 'out', 1, 'sale', 'INV20260006', cashier_id);

  -- ===== SALE 7 (refunded example) =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_7, 'INV20260007', 'c0000000-0000-0000-0000-000000000006', admin_id,
          175.00, 0.00,  8.75, 183.75, 'cash', 'refunded', 'Customer returned item - damaged', '2026-06-07T18:00:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_7, 'b0000000-0000-0000-0000-000000000003', 'Dairy Milk Silk', 1, 175.00, 175.00, 8.75);

  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES ('b0000000-0000-0000-0000-000000000003', 'in', 1, 'return', 'INV20260007', admin_id);

  -- ===== SALE 8 (cancelled example) =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_8, 'INV20260008', 'c0000000-0000-0000-0000-000000000007', manager_id,
          450.00, 0.00, 22.50, 472.50, 'upi', 'cancelled', 'Customer cancelled before pickup', '2026-06-07T09:15:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_8, 'b0000000-0000-0000-0000-000000000005', 'India Gate Rice 5kg', 1, 450.00, 450.00, 22.50);

  -- No stock movement for cancelled order since it wasn't fulfilled

  -- ===== INITIAL STOCK-IN MOVEMENTS (opening stock) =====
  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'in', 200, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000002', 'in', 100, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000003', 'in',  80, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000004', 'in', 150, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000005', 'in',  50, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000006', 'in', 250, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000007', 'in', 600, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000008', 'in',  30, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000009', 'in',  25, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000010', 'in',  50, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000011', 'in', 120, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000012', 'in', 300, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000013', 'in',  60, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000014', 'in',  20, 'initial stock', 'OPENING', admin_id),
    ('b0000000-0000-0000-0000-000000000015', 'in',  40, 'initial stock', 'OPENING', admin_id);

  -- ===== SUPPLIER RESTOCK MOVEMENTS =====
  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, cost, supplier_id, user_id) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'in', 50,  'supplier restock', 'PO-2026-001', 1000.00, 'd0000000-0000-0000-0000-000000000001', admin_id),
    ('b0000000-0000-0000-0000-000000000002', 'in', 30,  'supplier restock', 'PO-2026-002',  960.00, 'd0000000-0000-0000-0000-000000000002', admin_id),
    ('b0000000-0000-0000-0000-000000000008', 'in', 10,  'supplier restock', 'PO-2026-003', 5200.00, 'd0000000-0000-0000-0000-000000000003', admin_id);

  -- ===== DAMAGED/EXPIRED STOCK =====
  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id) VALUES
    ('b0000000-0000-0000-0000-000000000012', 'out', 3,  'damaged', 'DAMAGE-001', admin_id),
    ('b0000000-0000-0000-0000-000000000001', 'out', 2,  'expired', 'EXPIRY-001', admin_id);

END $$;
