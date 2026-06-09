import type { User, Product, Category, Customer, Supplier, Sale, SaleItem, Employee } from "@/types"

export const mockUsers: User[] = [
  { id: "EMP001", email: "admin@smartpos.com", name: "Naveya Admin", role: "admin", phone: "9876543210", created_at: "2026-01-01" },
  { id: "EMP002", email: "manager@smartpos.com", name: "Karthik", role: "manager", phone: "9876543211", created_at: "2026-01-01" },
  { id: "EMP003", email: "cashier1@smartpos.com", name: "Meena", role: "cashier", phone: "9876543212", created_at: "2026-01-01" },
  { id: "EMP004", email: "cashier2@smartpos.com", name: "Arun", role: "cashier", phone: "9876543213", created_at: "2026-01-01" },
]

export const mockCategories: Category[] = [
  { id: "CAT001", name: "Groceries", description: "Daily grocery and food items", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "CAT002", name: "Beverages", description: "Drinks and beverages", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "CAT003", name: "Electronics", description: "Electronic accessories and devices", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "CAT004", name: "Stationery", description: "Office and school supplies", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "CAT005", name: "Fashion", description: "Clothing and accessories", created_at: "2026-01-01", updated_at: "2026-01-01" },
]

export const mockProducts: Product[] = [
  {
    id: "PRD001", name: "Aavin Milk 500ml", sku: "PRD001", barcode: "890100000001",
    category_id: "CAT002", category_name: "Beverages", purchase_price: 20, selling_price: 28,
    stock_quantity: 150, min_stock_level: 20, gst_percentage: 12, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD002", name: "Coca Cola 750ml", sku: "PRD002", barcode: "890100000002",
    category_id: "CAT002", category_name: "Beverages", purchase_price: 32, selling_price: 45,
    stock_quantity: 80, min_stock_level: 15, gst_percentage: 12, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD003", name: "Dairy Milk Silk", sku: "PRD003", barcode: "890100000003",
    category_id: "CAT001", category_name: "Groceries", purchase_price: 130, selling_price: 175,
    stock_quantity: 60, min_stock_level: 10, gst_percentage: 5, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD004", name: "Lux Soap", sku: "PRD004", barcode: "890100000004",
    category_id: "CAT001", category_name: "Groceries", purchase_price: 30, selling_price: 42,
    stock_quantity: 120, min_stock_level: 20, gst_percentage: 5, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD005", name: "India Gate Rice 5kg", sku: "PRD005", barcode: "890100000005",
    category_id: "CAT001", category_name: "Groceries", purchase_price: 350, selling_price: 450,
    stock_quantity: 35, min_stock_level: 10, gst_percentage: 5, unit: "Bag",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD006", name: "Classmate Notebook", sku: "PRD006", barcode: "890100000006",
    category_id: "CAT004", category_name: "Stationery", purchase_price: 42, selling_price: 60,
    stock_quantity: 200, min_stock_level: 30, gst_percentage: 5, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD007", name: "Reynolds Pen", sku: "PRD007", barcode: "890100000007",
    category_id: "CAT004", category_name: "Stationery", purchase_price: 10, selling_price: 15,
    stock_quantity: 500, min_stock_level: 50, gst_percentage: 5, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD008", name: "USB Keyboard", sku: "PRD008", barcode: "890100000008",
    category_id: "CAT003", category_name: "Electronics", purchase_price: 520, selling_price: 699,
    stock_quantity: 25, min_stock_level: 30, gst_percentage: 18, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD009", name: "Wireless Mouse", sku: "PRD009", barcode: "890100000009",
    category_id: "CAT003", category_name: "Electronics", purchase_price: 670, selling_price: 899,
    stock_quantity: 18, min_stock_level: 20, gst_percentage: 18, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "PRD010", name: "Men's T-Shirt", sku: "PRD010", barcode: "890100000010",
    category_id: "CAT005", category_name: "Fashion", purchase_price: 440, selling_price: 599,
    stock_quantity: 40, min_stock_level: 10, gst_percentage: 5, unit: "Pcs",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
]

export const mockCustomers: Customer[] = [
  { id: "CUS001", name: "Arjun Kumar", phone: "9876543210", email: "arjun@email.com", address: "Chennai", loyalty_points: 520, created_at: "2026-01-15", updated_at: "2026-01-15" },
  { id: "CUS002", name: "Priya S", phone: "9876543211", email: "priya@email.com", address: "Coimbatore", loyalty_points: 310, created_at: "2026-02-10", updated_at: "2026-02-10" },
  { id: "CUS003", name: "Rahul M", phone: "9876543212", email: "rahul@email.com", address: "Bangalore", loyalty_points: 180, created_at: "2026-03-05", updated_at: "2026-03-05" },
  { id: "CUS004", name: "Kavya R", phone: "9876543213", email: "kavya@email.com", address: "Hyderabad", loyalty_points: 95, created_at: "2026-03-20", updated_at: "2026-03-20" },
  { id: "CUS005", name: "Sanjay P", phone: "9876543214", email: "sanjay@email.com", address: "Madurai", loyalty_points: 245, created_at: "2026-04-01", updated_at: "2026-04-01" },
]

export const mockSuppliers: Supplier[] = [
  { id: "SUP001", name: "Aavin Distributor", phone: "9840011111", email: "info@aavindistributor.com", address: "Chennai", gst_number: "33AABC1234D1Z5", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "SUP002", name: "Coca Cola India", phone: "9840022222", email: "orders@cocacola.in", address: "Mumbai", gst_number: "27AABC5678E1Z2", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "SUP003", name: "IT World Suppliers", phone: "9840033333", email: "sales@itworld.in", address: "Bangalore", gst_number: "29AABC9101F1Z3", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "SUP004", name: "Classmate Wholesale", phone: "9840044444", email: "bulk@classmate.in", address: "Pune", gst_number: "27AABC1121G1Z4", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "SUP005", name: "Fashion Hub Traders", phone: "9840055555", email: "contact@fashionhub.in", address: "Delhi", gst_number: "07AABC3141H1Z5", created_at: "2026-01-01", updated_at: "2026-01-01" },
]

function createItems(...args: [string, number][]): SaleItem[] {
  return args.map(([productId, quantity], i) => {
    const product = mockProducts.find((p) => p.id === productId)!
    return {
      id: `item${i + 1}`,
      sale_id: "",
      product_id: productId,
      product_name: product.name,
      quantity,
      price: product.selling_price,
      subtotal: product.selling_price * quantity,
      gst_amount: Math.round((product.selling_price * quantity * product.gst_percentage) / 100),
    }
  })
}

const items1 = createItems(["PRD001", 5], ["PRD004", 2], ["PRD003", 1], ["PRD007", 3], ["PRD006", 1])
const sub1 = items1.reduce((s, i) => s + i.subtotal, 0)
const gst1 = items1.reduce((s, i) => s + i.gst_amount, 0)

const items2 = createItems(["PRD005", 2], ["PRD001", 2], ["PRD002", 3], ["PRD007", 10])
const sub2 = items2.reduce((s, i) => s + i.subtotal, 0)
const gst2 = items2.reduce((s, i) => s + i.gst_amount, 0)

const items3 = createItems(["PRD008", 1], ["PRD009", 1])
const sub3 = items3.reduce((s, i) => s + i.subtotal, 0)
const gst3 = items3.reduce((s, i) => s + i.gst_amount, 0)

const items4 = createItems(["PRD001", 3], ["PRD002", 2], ["PRD004", 1], ["PRD007", 5])
const sub4 = items4.reduce((s, i) => s + i.subtotal, 0)
const gst4 = items4.reduce((s, i) => s + i.gst_amount, 0)

const items5 = createItems(["PRD005", 1], ["PRD010", 2], ["PRD003", 1], ["PRD006", 2], ["PRD007", 5])
const sub5 = items5.reduce((s, i) => s + i.subtotal, 0)
const gst5 = items5.reduce((s, i) => s + i.gst_amount, 0)

export const mockSales: Sale[] = [
  {
    id: "s1", invoice_number: "INV1001", customer_id: "CUS001", customer_name: "Arjun Kumar",
    user_id: "EMP001", user_name: "Naveya Admin", subtotal: sub1, discount: 16, tax: gst1, total: 523,
    payment_method: "upi", status: "completed", items: items1, created_at: "2026-06-08T10:30:00",
  },
  {
    id: "s2", invoice_number: "INV1002", customer_id: "CUS002", customer_name: "Priya S",
    user_id: "EMP003", user_name: "Meena", subtotal: sub2, discount: 0, tax: gst2, total: 1245,
    payment_method: "cash", status: "completed", items: items2, created_at: "2026-06-08T12:15:00",
  },
  {
    id: "s3", invoice_number: "INV1003", customer_id: "CUS003", customer_name: "Rahul M",
    user_id: "EMP003", user_name: "Meena", subtotal: sub3, discount: 0, tax: gst3, total: 899,
    payment_method: "card", status: "completed", items: items3, created_at: "2026-06-08T14:45:00",
  },
  {
    id: "s4", invoice_number: "INV1004", customer_id: "CUS004", customer_name: "Kavya R",
    user_id: "EMP001", user_name: "Naveya Admin", subtotal: sub4, discount: 0, tax: gst4, total: 342,
    payment_method: "upi", status: "completed", items: items4, created_at: "2026-06-09T09:00:00",
  },
  {
    id: "s5", invoice_number: "INV1005", customer_id: "CUS005", customer_name: "Sanjay P",
    user_id: "EMP002", user_name: "Karthik", subtotal: sub5, discount: 0, tax: gst5, total: 1999,
    payment_method: "cash", status: "completed", items: items5, created_at: "2026-06-09T11:20:00",
  },
]

export const mockEmployees: Employee[] = [
  { id: "EMP001", name: "Naveya Admin", email: "admin@smartpos.com", phone: "9876543210", role: "admin", is_active: true, created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "EMP002", name: "Karthik", email: "manager@smartpos.com", phone: "9876543211", role: "manager", is_active: true, created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "EMP003", name: "Meena", email: "cashier1@smartpos.com", phone: "9876543212", role: "cashier", is_active: true, created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: "EMP004", name: "Arun", email: "cashier2@smartpos.com", phone: "9876543213", role: "cashier", is_active: true, created_at: "2026-01-01", updated_at: "2026-01-01" },
]
