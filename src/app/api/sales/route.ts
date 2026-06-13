import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { checkDemoAccess } from "@/lib/demo-guard"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const dateFilter = searchParams.get("dateFilter")
  const search = searchParams.get("search")
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)
  const offset = Number(searchParams.get("offset")) || 0

  let query = supabase
    .from("sales")
    .select("*, sale_items(*), profiles!sales_user_id_fkey(name), customers!sales_customer_id_fkey(name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (dateFilter && dateFilter !== "all") {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (dateFilter === "today") {
      query = query.gte("created_at", startOfDay.toISOString())
    } else if (dateFilter === "weekly") {
      const weekAgo = new Date(startOfDay)
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte("created_at", weekAgo.toISOString())
    } else if (dateFilter === "monthly") {
      const monthAgo = new Date(startOfDay)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte("created_at", monthAgo.toISOString())
    }
  }

  let { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let enriched = (data || []).map((s: any) => ({
    ...s,
    items: s.sale_items || [],
    user_name: s.profiles?.name || "Unknown",
    customer_name: s.customers?.name || null,
    profiles: undefined,
    customers: undefined,
    sale_items: undefined,
  }))

  if (search) {
    const q = search.toLowerCase()
    enriched = enriched.filter(
      (s: any) =>
        s.invoice_number?.toLowerCase().includes(q) ||
        s.customer_name?.toLowerCase().includes(q),
    )
  }

  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const guard = await checkDemoAccess(); if (guard) return guard
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const year = new Date().getFullYear()
  const { data: lastSale } = await supabase
    .from("sales")
    .select("invoice_number")
    .ilike("invoice_number", `INV${year}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let counter = 1000
  if (lastSale?.invoice_number) {
    const match = lastSale.invoice_number.match(/\d{5}$/)
    if (match) counter = parseInt(match[0], 10)
  }
  const invoiceNumber = `INV${year}${String(counter + 1).padStart(5, "0")}`

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      invoice_number: invoiceNumber,
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
          reference: invoiceNumber,
          user_id: session.user.id,
        })
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", session.user.id)
    .single()

  let customerName: string | null = null
  if (body.customer_id) {
    const { data: cust } = await supabase
      .from("customers")
      .select("name")
      .eq("id", body.customer_id)
      .single()
    if (cust) customerName = cust.name
  }

  return NextResponse.json({
    ...sale,
    items: saleItems,
    user_name: profile?.name || "Unknown",
    customer_name: customerName,
  }, { status: 201 })
}
