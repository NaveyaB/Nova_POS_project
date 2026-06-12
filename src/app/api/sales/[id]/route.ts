import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*), profiles!sales_user_id_fkey(name), customers!sales_customer_id_fkey(name)")
    .eq("id", id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    ...data,
    items: (data as any)?.sale_items || [],
    user_name: (data as any)?.profiles?.name || "Unknown",
    customer_name: (data as any)?.customers?.name || null,
    profiles: undefined,
    customers: undefined,
    sale_items: undefined,
  })
}
