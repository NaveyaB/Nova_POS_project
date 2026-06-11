-- ============================================================
-- SmartPOS - Complete Database Setup Script
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. TABLE CREATION
-- ============================================================

-- Profiles / Users table (syncs with auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'manager')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 5,
  image_url TEXT,
  gst_percentage DECIMAL(5,2) DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'net_banking')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2) DEFAULT 0
);

-- Stock Movements
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT,
  cost DECIMAL(10,2),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_created ON sales(created_at);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);

-- ============================================================
-- 4. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (id = auth.uid());

-- CATEGORIES
CREATE POLICY "categories_select" ON categories FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "categories_update" ON categories FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "categories_delete" ON categories FOR DELETE
  TO authenticated USING (true);

-- PRODUCTS
CREATE POLICY "products_select" ON products FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE
  TO authenticated USING (true);

-- CUSTOMERS
CREATE POLICY "customers_select" ON customers FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "customers_insert" ON customers FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "customers_update" ON customers FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "customers_delete" ON customers FOR DELETE
  TO authenticated USING (true);

-- SUPPLIERS
CREATE POLICY "suppliers_select" ON suppliers FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "suppliers_insert" ON suppliers FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "suppliers_update" ON suppliers FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "suppliers_delete" ON suppliers FOR DELETE
  TO authenticated USING (true);

-- SALES
CREATE POLICY "sales_select" ON sales FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "sales_insert" ON sales FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "sales_update" ON sales FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "sales_delete" ON sales FOR DELETE
  TO authenticated USING (true);

-- SALE_ITEMS
CREATE POLICY "sale_items_select" ON sale_items FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "sale_items_insert" ON sale_items FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "sale_items_update" ON sale_items FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "sale_items_delete" ON sale_items FOR DELETE
  TO authenticated USING (true);

-- STOCK_MOVEMENTS
CREATE POLICY "stock_movements_select" ON stock_movements FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "stock_movements_insert" ON stock_movements FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "stock_movements_update" ON stock_movements FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "stock_movements_delete" ON stock_movements FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 7. SEED DATA - PROFILES
-- ============================================================
-- Note: Profiles reference auth.users. Create users in Supabase
-- Auth dashboard first, then these INSERTs will link them.
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

-- ============================================================
-- 8. SEED DATA - CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Groceries',   'Daily grocery and food items'),
  ('a0000000-0000-0000-0000-000000000002', 'Beverages',   'Drinks and beverages'),
  ('a0000000-0000-0000-0000-000000000003', 'Electronics', 'Electronic accessories and devices'),
  ('a0000000-0000-0000-0000-000000000004', 'Stationery',  'Office and school supplies'),
  ('a0000000-0000-0000-0000-000000000005', 'Fashion',     'Clothing and accessories')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. SEED DATA - PRODUCTS
-- ============================================================
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

-- ============================================================
-- 10. SEED DATA - CUSTOMERS
-- ============================================================
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

-- ============================================================
-- 11. SEED DATA - SUPPLIERS
-- ============================================================
INSERT INTO suppliers (id, name, phone, email, address, gst_number) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Aavin Distributor',    '9840011111', 'info@aavindistributor.com',  'Chennai',   '33AABC1234D1Z5'),
  ('d0000000-0000-0000-0000-000000000002', 'Coca Cola India',      '9840022222', 'orders@cocacola.in',         'Mumbai',    '27AABC5678E1Z2'),
  ('d0000000-0000-0000-0000-000000000003', 'IT World Suppliers',   '9840033333', 'sales@itworld.in',           'Bangalore', '29AABC9101F1Z3'),
  ('d0000000-0000-0000-0000-000000000004', 'Classmate Wholesale',  '9840044444', 'bulk@classmate.in',          'Pune',      '27AABC1121G1Z4'),
  ('d0000000-0000-0000-0000-000000000005', 'Fashion Hub Traders',  '9840055555', 'contact@fashionhub.in',      'Delhi',     '07AABC3141H1Z5'),
  ('d0000000-0000-0000-0000-000000000006', 'Boat Electronics',     '9840066666', 'b2b@boat.in',                'Mumbai',    '27AABC4151H1Z6')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 12. SEED DATA - SALES + SALE_ITEMS + STOCK_MOVEMENTS
-- ============================================================
DO $$
DECLARE
  admin_id 3eddc723-8274-463e-80c5-89ac8fa87600;
  cashier_id 4f386a24-bcf7-4ad6-95bf-c990562afbda;
  manager_id a197760a-0042-42ce-ab0b-f59452808fe1;
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
  SELECT id INTO admin_id   FROM profiles WHERE email = 'admin@novapos.com'   LIMIT 1;
  SELECT id INTO cashier_id FROM profiles WHERE email = 'cashier1@novapos.com' LIMIT 1;
  SELECT id INTO manager_id FROM profiles WHERE email = 'manager@novapos.com'  LIMIT 1;

  -- Fallback: if no profile found, use placeholder UUIDs
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

  -- ===== SALE 7 (refunded) =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_7, 'INV20260007', 'c0000000-0000-0000-0000-000000000006', admin_id,
          175.00, 0.00,  8.75, 183.75, 'cash', 'refunded', 'Customer returned item - damaged', '2026-06-07T18:00:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_7, 'b0000000-0000-0000-0000-000000000003', 'Dairy Milk Silk', 1, 175.00, 175.00, 8.75);

  INSERT INTO stock_movements (product_id, type, quantity, reason, reference, user_id)
  VALUES ('b0000000-0000-0000-0000-000000000003', 'in', 1, 'return', 'INV20260007', admin_id);

  -- ===== SALE 8 (cancelled) =====
  INSERT INTO sales (id, invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, status, notes, created_at)
  VALUES (sale_id_8, 'INV20260008', 'c0000000-0000-0000-0000-000000000007', manager_id,
          450.00, 0.00, 22.50, 472.50, 'upi', 'cancelled', 'Customer cancelled before pickup', '2026-06-07T09:15:00+05:30');

  INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, gst_amount) VALUES
    (sale_id_8, 'b0000000-0000-0000-0000-000000000005', 'India Gate Rice 5kg', 1, 450.00, 450.00, 22.50);

  -- ===== INITIAL STOCK-IN MOVEMENTS =====
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
