import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const fetchWithFallback = async <T>(fn: () => PromiseLike<{ data: T | null; error: any; count?: number | null }>, fallback: T): Promise<{ data: T; count?: number }> => {
    try {
      const result = await fn()
      if (result.error) return { data: fallback }
      return { data: (result.data ?? fallback) as T, count: result.count ?? undefined }
    } catch {
      return { data: fallback }
    }
  }

  const results = await Promise.all([
    fetchWithFallback(
      () => supabase.from("sales").select("total").gte("created_at", today.toISOString()),
      [] as any[],
    ),
    fetchWithFallback(
      () => supabase.from("sales").select("total").gte("created_at", startOfMonth.toISOString()),
      [] as any[],
    ),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true).then(
      (r) => ({ data: { count: r.count ?? 0 }, error: r.error }),
      () => ({ data: { count: 0 }, error: null }),
    ),
    fetchWithFallback(
      () => supabase.from("products").select("id, name, sku, stock_quantity, min_stock_level"),
      [] as any[],
    ),
    supabase.from("customers").select("*", { count: "exact", head: true }).then(
      (r) => ({ data: { count: r.count ?? 0 }, error: r.error }),
      () => ({ data: { count: 0 }, error: null }),
    ),
  ])

  const todaySales: any[] = Array.isArray(results[0].data) ? results[0].data : []
  const monthlySales: any[] = Array.isArray(results[1].data) ? results[1].data : []
  const productsCount = (results[2] as any)?.data?.count ?? 0
  const allProducts: any[] = Array.isArray(results[3].data) ? results[3].data : []
  const customersCount = (results[4] as any)?.data?.count ?? 0

  const lowStockItems = allProducts.filter(
    (p: any) => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0
  )

  const todayRevenue = todaySales.reduce((sum: number, s: any) => sum + (s.total || 0), 0)
  const monthlyRevenue = monthlySales.reduce((sum: number, s: any) => sum + (s.total || 0), 0)

  return NextResponse.json({
    today_sales: todayRevenue,
    monthly_sales: monthlyRevenue,
    total_products: productsCount,
    low_stock_products: lowStockItems.length,
    total_customers: customersCount,
    total_orders: monthlySales.length,
    today_orders: todaySales.length,
    low_stock_items: lowStockItems,
  })
}
