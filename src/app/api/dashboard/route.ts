import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    { data: todaySales },
    { data: monthlySales },
    { count: productsCount },
    { data: allProducts },
    { count: customersCount },
  ] = await Promise.all([
    supabase.from("sales").select("*").gte("created_at", today.toISOString()),
    supabase.from("sales").select("*").gte("created_at", startOfMonth.toISOString()),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id, name, sku, stock_quantity, min_stock_level"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
  ])

  const lowStockItems = (allProducts || []).filter(
    (p: any) => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0
  )

  const todayRevenue = (todaySales || []).reduce((sum: number, s: any) => sum + s.total, 0)
  const monthlyRevenue = (monthlySales || []).reduce((sum: number, s: any) => sum + s.total, 0)

  return NextResponse.json({
    today_sales: todayRevenue,
    monthly_sales: monthlyRevenue,
    total_products: productsCount || 0,
    low_stock_products: lowStockItems.length,
    total_customers: customersCount || 0,
    total_orders: (monthlySales || []).length,
    today_orders: (todaySales || []).length,
    low_stock_items: lowStockItems,
  })
}
