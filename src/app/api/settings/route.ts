import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { checkDemoAccess } from "@/lib/demo-guard"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .single()

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({
        store_name: "SmartPOS Store",
        logo_url: "",
        address: "123 Main Street, City, State - 400001",
        gst_number: "27AAACG1234H1Z5",
        phone: "9876543210",
        email: "store@smartpos.com",
        currency: "INR",
        tax_rate: 18,
        receipt_footer: "Thank you for your visit!",
        default_payment_method: "cash",
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const guard = await checkDemoAccess(); if (guard) return guard
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Only admins can update settings" }, { status: 403 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from("store_settings")
    .upsert({ id: "00000000-0000-0000-0000-000000000001", ...body }, { onConflict: "id" })
    .select()
    .single()

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ error: "Settings table not found. Run the SQL to create it." }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
