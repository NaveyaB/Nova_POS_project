import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const movements = data.map((m: any) => ({
    ...m,
    product_name: m.products?.name || "Unknown",
    products: undefined,
  }))

  return NextResponse.json(movements)
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.product_id || !body.quantity || !body.type || !body.reason) {
    return NextResponse.json({ error: "product_id, quantity, type, and reason are required" }, { status: 400 })
  }

  const qty = Number(body.quantity)
  if (qty <= 0) {
    return NextResponse.json({ error: "Quantity must be positive" }, { status: 400 })
  }

  if (!["in", "out"].includes(body.type)) {
    return NextResponse.json({ error: "Type must be 'in' or 'out'" }, { status: 400 })
  }

  const { data: product } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", body.product_id)
    .single()

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  if (body.type === "out" && qty > product.stock_quantity) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
  }

  const newQuantity = body.type === "in"
    ? product.stock_quantity + qty
    : product.stock_quantity - qty

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock_quantity: newQuantity })
    .eq("id", body.product_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const { data: movement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      product_id: body.product_id,
      type: body.type,
      quantity: qty,
      reason: body.reason,
      reference: body.reference || null,
      cost: body.cost || null,
      supplier_id: body.supplier_id || null,
      user_id: session.user.id,
    })
    .select()
    .single()

  if (movementError) return NextResponse.json({ error: movementError.message }, { status: 500 })

  return NextResponse.json(movement, { status: 201 })
}
