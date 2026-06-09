import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const dateFilter = searchParams.get("dateFilter")
  const search = searchParams.get("search")

  let query = supabase
    .from("sales")
    .select("*, sale_items(*)")
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`invoice_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let filtered = data

  if (dateFilter && dateFilter !== "all") {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (dateFilter === "today") {
      filtered = data.filter((s: any) => new Date(s.created_at) >= startOfDay)
    } else if (dateFilter === "weekly") {
      const weekAgo = new Date(startOfDay)
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = data.filter((s: any) => new Date(s.created_at) >= weekAgo)
    } else if (dateFilter === "monthly") {
      const monthAgo = new Date(startOfDay)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filtered = data.filter((s: any) => new Date(s.created_at) >= monthAgo)
    }
  }

  return NextResponse.json(filtered)
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      invoice_number: body.invoice_number,
      customer_id: body.customer_id || null,
      user_id: session.user.id,
      subtotal: body.subtotal,
      discount: body.discount || 0,
      tax: body.tax || 0,
      total: body.total,
      payment_method: body.payment_method,
      status: "completed",
    })
    .select()
    .single()

  if (saleError) return NextResponse.json({ error: saleError.message }, { status: 500 })

  const saleItems = (body.items || []).map((item: any) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
    gst_amount: item.gst_amount || 0,
  }))

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(saleItems)

  if (itemsError) {
    await supabase.from("sales").delete().eq("id", sale.id)
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  for (const item of saleItems) {
    const { data: product } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", item.product_id)
      .single()

    if (product) {
      await supabase
        .from("products")
        .update({ stock_quantity: product.stock_quantity - item.quantity })
        .eq("id", item.product_id)

      await supabase
        .from("stock_movements")
        .insert({
          product_id: item.product_id,
          type: "out",
          quantity: item.quantity,
          reason: "sale",
          reference: body.invoice_number,
          user_id: session.user.id,
        })
    }
  }

  return NextResponse.json({ ...sale, items: saleItems }, { status: 201 })
}
