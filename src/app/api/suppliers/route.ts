import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { checkDemoAccess } from "@/lib/demo-guard"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const guard = await checkDemoAccess(); if (guard) return guard
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  if (!body.name || !body.phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      address: body.address || null,
      gst_number: body.gst_number || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
