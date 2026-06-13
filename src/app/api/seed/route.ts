import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { checkDemoAccess } from "@/lib/demo-guard"

const CATEGORIES = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Groceries", description: "Daily grocery and food items" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Beverages", description: "Drinks and beverages" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Electronics", description: "Electronic accessories and devices" },
  { id: "a0000000-0000-0000-0000-000000000004", name: "Stationery", description: "Office and school supplies" },
  { id: "a0000000-0000-0000-0000-000000000005", name: "Fashion", description: "Clothing and accessories" },
]

const PRODUCTS = [
  { id: "b0000000-0000-0000-0000-000000000001", name: "Aavin Milk 500ml", sku: "SKU001", barcode: "890100000001", category_id: CATEGORIES[1].id, purchase_price: 20, selling_price: 28, stock_quantity: 150, min_stock_level: 20, gst_percentage: 12, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000002", name: "Coca Cola 750ml", sku: "SKU002", barcode: "890100000002", category_id: CATEGORIES[1].id, purchase_price: 32, selling_price: 45, stock_quantity: 80, min_stock_level: 15, gst_percentage: 12, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000003", name: "Dairy Milk Silk", sku: "SKU003", barcode: "890100000003", category_id: CATEGORIES[0].id, purchase_price: 130, selling_price: 175, stock_quantity: 60, min_stock_level: 10, gst_percentage: 5, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000004", name: "Lux Soap", sku: "SKU004", barcode: "890100000004", category_id: CATEGORIES[0].id, purchase_price: 30, selling_price: 42, stock_quantity: 120, min_stock_level: 20, gst_percentage: 5, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000005", name: "India Gate Rice 5kg", sku: "SKU005", barcode: "890100000005", category_id: CATEGORIES[0].id, purchase_price: 350, selling_price: 450, stock_quantity: 35, min_stock_level: 10, gst_percentage: 5, unit: "bag" },
  { id: "b0000000-0000-0000-0000-000000000006", name: "Classmate Notebook", sku: "SKU006", barcode: "890100000006", category_id: CATEGORIES[3].id, purchase_price: 42, selling_price: 60, stock_quantity: 200, min_stock_level: 30, gst_percentage: 5, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000007", name: "Reynolds Pen", sku: "SKU007", barcode: "890100000007", category_id: CATEGORIES[3].id, purchase_price: 10, selling_price: 15, stock_quantity: 500, min_stock_level: 50, gst_percentage: 5, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000008", name: "USB Keyboard", sku: "SKU008", barcode: "890100000008", category_id: CATEGORIES[2].id, purchase_price: 520, selling_price: 699, stock_quantity: 25, min_stock_level: 30, gst_percentage: 18, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000009", name: "Wireless Mouse", sku: "SKU009", barcode: "890100000009", category_id: CATEGORIES[2].id, purchase_price: 670, selling_price: 899, stock_quantity: 18, min_stock_level: 20, gst_percentage: 18, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000010", name: "Mens T-Shirt", sku: "SKU010", barcode: "890100000010", category_id: CATEGORIES[4].id, purchase_price: 440, selling_price: 599, stock_quantity: 40, min_stock_level: 10, gst_percentage: 5, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000011", name: "Sprite 600ml", sku: "SKU011", barcode: "890100000011", category_id: CATEGORIES[1].id, purchase_price: 28, selling_price: 40, stock_quantity: 95, min_stock_level: 15, gst_percentage: 12, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000012", name: "Lays Chips", sku: "SKU012", barcode: "890100000012", category_id: CATEGORIES[0].id, purchase_price: 15, selling_price: 20, stock_quantity: 200, min_stock_level: 30, gst_percentage: 5, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000013", name: "Pencil Box", sku: "SKU013", barcode: "890100000013", category_id: CATEGORIES[3].id, purchase_price: 85, selling_price: 120, stock_quantity: 45, min_stock_level: 10, gst_percentage: 5, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000014", name: "Bluetooth Speaker", sku: "SKU014", barcode: "890100000014", category_id: CATEGORIES[2].id, purchase_price: 1200, selling_price: 1799, stock_quantity: 12, min_stock_level: 10, gst_percentage: 18, unit: "pcs" },
  { id: "b0000000-0000-0000-0000-000000000015", name: "Womens Kurta", sku: "SKU015", barcode: "890100000015", category_id: CATEGORIES[4].id, purchase_price: 650, selling_price: 899, stock_quantity: 25, min_stock_level: 8, gst_percentage: 5, unit: "pcs" },
]

const CUSTOMERS = [
  { id: "c0000000-0000-0000-0000-000000000001", name: "Arjun Kumar", phone: "9876543210", email: "arjun@email.com", address: "Chennai", loyalty_points: 520 },
  { id: "c0000000-0000-0000-0000-000000000002", name: "Priya S", phone: "9876543211", email: "priya@email.com", address: "Coimbatore", loyalty_points: 310 },
  { id: "c0000000-0000-0000-0000-000000000003", name: "Rahul M", phone: "9876543212", email: "rahul@email.com", address: "Bangalore", loyalty_points: 180 },
  { id: "c0000000-0000-0000-0000-000000000004", name: "Kavya R", phone: "9876543213", email: "kavya@email.com", address: "Hyderabad", loyalty_points: 95 },
  { id: "c0000000-0000-0000-0000-000000000005", name: "Sanjay P", phone: "9876543214", email: "sanjay@email.com", address: "Madurai", loyalty_points: 245 },
  { id: "c0000000-0000-0000-0000-000000000006", name: "Deepa K", phone: "9876543215", email: "deepa@email.com", address: "Chennai", loyalty_points: 410 },
  { id: "c0000000-0000-0000-0000-000000000007", name: "Venkat R", phone: "9876543216", email: "venkat@email.com", address: "Bangalore", loyalty_points: 160 },
  { id: "c0000000-0000-0000-0000-000000000008", name: "Anita Sharma", phone: "9876543217", email: "anita@email.com", address: "Delhi", loyalty_points: 75 },
]

const SUPPLIERS = [
  { id: "d0000000-0000-0000-0000-000000000001", name: "Aavin Distributor", phone: "9840011111", email: "info@aavindistributor.com", address: "Chennai", gst_number: "33AABC1234D1Z5" },
  { id: "d0000000-0000-0000-0000-000000000002", name: "Coca Cola India", phone: "9840022222", email: "orders@cocacola.in", address: "Mumbai", gst_number: "27AABC5678E1Z2" },
  { id: "d0000000-0000-0000-0000-000000000003", name: "IT World Suppliers", phone: "9840033333", email: "sales@itworld.in", address: "Bangalore", gst_number: "29AABC9101F1Z3" },
  { id: "d0000000-0000-0000-0000-000000000004", name: "Classmate Wholesale", phone: "9840044444", email: "bulk@classmate.in", address: "Pune", gst_number: "27AABC1121G1Z4" },
  { id: "d0000000-0000-0000-0000-000000000005", name: "Fashion Hub Traders", phone: "9840055555", email: "contact@fashionhub.in", address: "Delhi", gst_number: "07AABC3141H1Z5" },
  { id: "d0000000-0000-0000-0000-000000000006", name: "Boat Electronics", phone: "9840066666", email: "b2b@boat.in", address: "Mumbai", gst_number: "27AABC4151H1Z6" },
]

const SALES_DATA = [
  {
    invoice: "INV20260001", customer: CUSTOMERS[0], subtotal: 548, discount: 16, tax: 41.70, total: 573.70,
    payment: "upi" as const, status: "completed" as const,
    items: [
      { pid: PRODUCTS[0].id, name: PRODUCTS[0].name, qty: 5, price: 28 },
      { pid: PRODUCTS[3].id, name: PRODUCTS[3].name, qty: 2, price: 42 },
      { pid: PRODUCTS[2].id, name: PRODUCTS[2].name, qty: 1, price: 175 },
      { pid: PRODUCTS[6].id, name: PRODUCTS[6].name, qty: 3, price: 15 },
      { pid: PRODUCTS[5].id, name: PRODUCTS[5].name, qty: 1, price: 60 },
    ],
    date: "2026-06-08T10:30:00+05:30",
  },
  {
    invoice: "INV20260002", customer: CUSTOMERS[1], subtotal: 1245, discount: 25, tax: 97.40, total: 1317.40,
    payment: "cash" as const, status: "completed" as const,
    items: [
      { pid: PRODUCTS[4].id, name: PRODUCTS[4].name, qty: 2, price: 450 },
      { pid: PRODUCTS[0].id, name: PRODUCTS[0].name, qty: 2, price: 28 },
      { pid: PRODUCTS[1].id, name: PRODUCTS[1].name, qty: 3, price: 45 },
      { pid: PRODUCTS[6].id, name: PRODUCTS[6].name, qty: 10, price: 15 },
    ],
    date: "2026-06-08T12:15:00+05:30",
  },
  {
    invoice: "INV20260003", customer: CUSTOMERS[2], subtotal: 1598, discount: 0, tax: 287.64, total: 1885.64,
    payment: "card" as const, status: "completed" as const,
    items: [
      { pid: PRODUCTS[7].id, name: PRODUCTS[7].name, qty: 1, price: 699 },
      { pid: PRODUCTS[8].id, name: PRODUCTS[8].name, qty: 1, price: 899 },
    ],
    date: "2026-06-08T14:45:00+05:30",
  },
  {
    invoice: "INV20260004", customer: null, subtotal: 780, discount: 0, tax: 60.00, total: 840.00,
    payment: "cash" as const, status: "completed" as const,
    items: [
      { pid: PRODUCTS[11].id, name: PRODUCTS[11].name, qty: 5, price: 20 },
      { pid: PRODUCTS[10].id, name: PRODUCTS[10].name, qty: 3, price: 40 },
      { pid: PRODUCTS[3].id, name: PRODUCTS[3].name, qty: 5, price: 42 },
      { pid: PRODUCTS[6].id, name: PRODUCTS[6].name, qty: 10, price: 15 },
      { pid: PRODUCTS[9].id, name: PRODUCTS[9].name, qty: 1, price: 599 },
    ],
    date: "2026-06-09T09:00:00+05:30",
  },
  {
    invoice: "INV20260005", customer: CUSTOMERS[4], subtotal: 2288, discount: 50, tax: 97.45, total: 2335.45,
    payment: "upi" as const, status: "completed" as const,
    items: [
      { pid: PRODUCTS[4].id, name: PRODUCTS[4].name, qty: 1, price: 450 },
      { pid: PRODUCTS[9].id, name: PRODUCTS[9].name, qty: 2, price: 599 },
      { pid: PRODUCTS[2].id, name: PRODUCTS[2].name, qty: 2, price: 175 },
      { pid: PRODUCTS[5].id, name: PRODUCTS[5].name, qty: 2, price: 60 },
      { pid: PRODUCTS[6].id, name: PRODUCTS[6].name, qty: 5, price: 15 },
      { pid: PRODUCTS[13].id, name: PRODUCTS[13].name, qty: 1, price: 1799 },
    ],
    date: "2026-06-09T11:20:00+05:30",
  },
  {
    invoice: "INV20260006", customer: null, subtotal: 304, discount: 0, tax: 30.29, total: 334.29,
    payment: "card" as const, status: "completed" as const,
    items: [
      { pid: PRODUCTS[10].id, name: PRODUCTS[10].name, qty: 2, price: 40 },
      { pid: PRODUCTS[11].id, name: PRODUCTS[11].name, qty: 5, price: 20 },
      { pid: PRODUCTS[12].id, name: PRODUCTS[12].name, qty: 1, price: 120 },
    ],
    date: "2026-06-09T15:30:00+05:30",
  },
  {
    invoice: "INV20260007", customer: CUSTOMERS[5], subtotal: 175, discount: 0, tax: 8.75, total: 183.75,
    payment: "cash" as const, status: "refunded" as const,
    items: [
      { pid: PRODUCTS[2].id, name: PRODUCTS[2].name, qty: 1, price: 175 },
    ],
    date: "2026-06-07T18:00:00+05:30",
  },
  {
    invoice: "INV20260008", customer: CUSTOMERS[6], subtotal: 450, discount: 0, tax: 22.50, total: 472.50,
    payment: "upi" as const, status: "cancelled" as const,
    items: [
      { pid: PRODUCTS[4].id, name: PRODUCTS[4].name, qty: 1, price: 450 },
    ],
    date: "2026-06-07T09:15:00+05:30",
  },
]

export async function POST() {
  const guard = await checkDemoAccess(); if (guard) return guard
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized - must be logged in as admin" }, { status: 401 })
  }

  const results: string[] = []

  try {
    // 1. Upsert categories
    for (const cat of CATEGORIES) {
      const { error } = await supabase.from("categories").upsert(cat, { onConflict: "id" })
      if (error) return NextResponse.json({ error: `Categories: ${error.message}` }, { status: 500 })
    }
    results.push(`✅ ${CATEGORIES.length} categories`)

    // 2. Upsert products
    for (const prod of PRODUCTS) {
      const { error } = await supabase.from("products").upsert(prod, { onConflict: "id" })
      if (error) return NextResponse.json({ error: `Products: ${error.message}` }, { status: 500 })
    }
    results.push(`✅ ${PRODUCTS.length} products`)

    // 3. Upsert customers
    for (const c of CUSTOMERS) {
      const { error } = await supabase.from("customers").upsert(c, { onConflict: "id" })
      if (error) return NextResponse.json({ error: `Customers: ${error.message}` }, { status: 500 })
    }
    results.push(`✅ ${CUSTOMERS.length} customers`)

    // 4. Upsert suppliers
    for (const s of SUPPLIERS) {
      const { error } = await supabase.from("suppliers").upsert(s, { onConflict: "id" })
      if (error) return NextResponse.json({ error: `Suppliers: ${error.message}` }, { status: 500 })
    }
    results.push(`✅ ${SUPPLIERS.length} suppliers`)

    // 5. Create or update profile for the current user
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        name: user.email?.split("@")[0] || "Admin User",
        email: user.email || "",
        phone: "9876543210",
        role: "admin",
        is_active: true,
      })
      if (profileError) return NextResponse.json({ error: `Profile: ${profileError.message}` }, { status: 500 })
      results.push(`✅ Profile created for ${user.email}`)
    }

    // 6. Insert sales, sale_items, and stock movements
    let saleCount = 0
    let itemCount = 0

    for (const saleData of SALES_DATA) {
      const { error: existingSale } = await supabase
        .from("sales")
        .select("id")
        .eq("invoice_number", saleData.invoice)
        .maybeSingle()

      if (existingSale) continue

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          invoice_number: saleData.invoice,
          customer_id: saleData.customer?.id ?? null,
          user_id: user.id,
          subtotal: saleData.subtotal,
          discount: saleData.discount,
          tax: saleData.tax,
          total: saleData.total,
          payment_method: saleData.payment,
          status: saleData.status,
          created_at: saleData.date,
        })
        .select("id")
        .single()

      if (saleError) return NextResponse.json({ error: `Sale ${saleData.invoice}: ${saleError.message}` }, { status: 500 })

      for (const item of saleData.items) {
        const subtotal = item.qty * item.price
        const gst = Math.round(subtotal * 0.05 * 100) / 100

        const { error: itemError } = await supabase.from("sale_items").insert({
          sale_id: sale.id,
          product_id: item.pid,
          product_name: item.name,
          quantity: item.qty,
          price: item.price,
          subtotal,
          gst_amount: gst,
        })
        if (itemError) return NextResponse.json({ error: `Sale item: ${itemError.message}` }, { status: 500 })
        itemCount++
      }

      if (saleData.status === "completed") {
        for (const item of saleData.items) {
          await supabase.from("stock_movements").insert({
            product_id: item.pid,
            type: "out",
            quantity: item.qty,
            reason: "sale",
            reference: saleData.invoice,
            user_id: user.id,
          })

          const { data: prod } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.pid)
            .single()

          if (prod) {
            await supabase
              .from("products")
              .update({ stock_quantity: prod.stock_quantity - item.qty })
              .eq("id", item.pid)
          }
        }
      }

      if (saleData.status === "refunded") {
        for (const item of saleData.items) {
          await supabase.from("stock_movements").insert({
            product_id: item.pid,
            type: "in",
            quantity: item.qty,
            reason: "return",
            reference: saleData.invoice,
            user_id: user.id,
          })

          const { data: prod } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.pid)
            .single()

          if (prod) {
            await supabase
              .from("products")
              .update({ stock_quantity: prod.stock_quantity + item.qty })
              .eq("id", item.pid)
          }
        }
      }

      saleCount++
    }
    results.push(`✅ ${saleCount} sales, ${itemCount} sale items`)

    // 7. Initial stock-in movements
    const { data: existingMovements } = await supabase
      .from("stock_movements")
      .select("id")
      .eq("reason", "initial stock")
      .limit(1)

    if (!existingMovements || existingMovements.length === 0) {
      for (const prod of PRODUCTS) {
        await supabase.from("stock_movements").insert({
          product_id: prod.id,
          type: "in",
          quantity: prod.stock_quantity,
          reason: "initial stock",
          reference: "OPENING",
          user_id: user.id,
        })
      }
      results.push(`✅ Opening stock entries`)
    }

    return NextResponse.json({ success: true, message: "Seed data inserted", details: results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
