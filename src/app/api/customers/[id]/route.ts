import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { checkDemoAccess } from "@/lib/demo-guard"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkDemoAccess(); if (guard) return guard
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("customers")
    .update({
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkDemoAccess(); if (guard) return guard
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
