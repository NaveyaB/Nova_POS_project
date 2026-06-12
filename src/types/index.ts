export type Role = "admin" | "cashier" | "manager"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  phone?: string
  avatar?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  category_id?: string
  category_name?: string
  brand?: string
  purchase_price: number
  selling_price: number
  stock_quantity: number
  min_stock_level: number
  image_url?: string
  gst_percentage: number
  unit: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  loyalty_points: number
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  gst_number?: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  subtotal: number
  gst_amount: number
  image_url?: string
}

export interface Sale {
  id: string
  invoice_number: string
  customer_id?: string
  customer_name?: string
  user_id: string
  user_name: string
  subtotal: number
  discount: number
  tax: number
  total: number
  payment_method: "cash" | "upi" | "card" | "net_banking"
  status: "completed" | "refunded" | "cancelled"
  items: SaleItem[]
  created_at: string
}

export interface StockMovement {
  id: string
  product_id: string
  product_name: string
  type: "in" | "out"
  quantity: number
  reason: string
  reference?: string
  cost?: number
  supplier_id?: string
  created_at: string
  user_id: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StoreSettings {
  store_name: string
  logo_url?: string
  address?: string
  gst_number?: string
  phone: string
  email?: string
  currency: string
  tax_rate: number
  receipt_footer?: string
}

export interface LowStockItem {
  id: string
  name: string
  sku: string
  stock_quantity: number
  min_stock_level: number
}

export interface DashboardStats {
  today_sales: number
  monthly_sales: number
  total_products: number
  low_stock_products: number
  total_customers: number
  total_orders: number
  low_stock_items: LowStockItem[]
}
