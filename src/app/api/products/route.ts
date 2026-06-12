import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const barcode = searchParams.get("barcode")
  const lowStock = searchParams.get("lowStock")

  let query = supabase
    .from("products")
    .select("*, categories(id, name)")
    .order("name")

  if (category && category !== "All") {
    query = query.eq("categories.name", category)
  }

  if (barcode) {
    query = query.eq("barcode", barcode)
  } else if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const products = (data || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name || null,
    categories: undefined,
  }))

  if (lowStock === "true") {
    return NextResponse.json(products.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level))
  }

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  if (!body.name || !body.sku || body.selling_price === undefined) {
    return NextResponse.json({ error: "Name, SKU, and selling price are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: body.name,
      description: body.description || null,
      sku: body.sku,
      barcode: body.barcode || null,
      category_id: body.category_id || null,
      brand: body.brand || null,
      purchase_price: body.purchase_price || 0,
      selling_price: body.selling_price,
      stock_quantity: body.stock_quantity || 0,
      min_stock_level: body.min_stock_level || 5,
      image_url: body.image_url || null,
      gst_percentage: body.gst_percentage || 0,
      unit: body.unit || "pcs",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
