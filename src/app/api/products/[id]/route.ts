import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("products")
    .update({
      name: body.name,
      description: body.description,
      sku: body.sku,
      barcode: body.barcode,
      category_id: body.category_id,
      brand: body.brand,
      purchase_price: body.purchase_price,
      selling_price: body.selling_price,
      stock_quantity: body.stock_quantity,
      min_stock_level: body.min_stock_level,
      image_url: body.image_url,
      gst_percentage: body.gst_percentage,
      unit: body.unit,
      is_active: body.is_active,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
