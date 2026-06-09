export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "updated_at">
        Update: Partial<Omit<Profile, "id">>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Category, "id">>
      }
      products: {
        Row: Product
        Insert: Omit<Product, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Product, "id">>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Customer, "id">>
      }
      suppliers: {
        Row: Supplier
        Insert: Omit<Supplier, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Supplier, "id">>
      }
      sales: {
        Row: Sale
        Insert: Omit<Sale, "id" | "created_at">
        Update: Partial<Omit<Sale, "id">>
      }
      sale_items: {
        Row: SaleItem
        Insert: Omit<SaleItem, "id">
        Update: Partial<Omit<SaleItem, "id">>
      }
      stock_movements: {
        Row: StockMovement
        Insert: Omit<StockMovement, "id" | "created_at">
        Update: Partial<Omit<StockMovement, "id">>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  role: "admin" | "cashier" | "manager"
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  sku: string
  barcode: string | null
  category_id: string | null
  brand: string | null
  purchase_price: number
  selling_price: number
  stock_quantity: number
  min_stock_level: number
  image_url: string | null
  gst_percentage: number
  unit: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  loyalty_points: number
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  gst_number: string | null
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  invoice_number: string
  customer_id: string | null
  user_id: string | null
  subtotal: number
  discount: number
  tax: number
  total: number
  payment_method: "cash" | "upi" | "card" | "net_banking"
  status: "completed" | "refunded" | "cancelled"
  notes: string | null
  created_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string | null
  product_name: string
  quantity: number
  price: number
  subtotal: number
  gst_amount: number
}

export interface StockMovement {
  id: string
  product_id: string
  type: "in" | "out"
  quantity: number
  reason: string
  reference: string | null
  cost: number | null
  supplier_id: string | null
  user_id: string | null
  created_at: string
}
