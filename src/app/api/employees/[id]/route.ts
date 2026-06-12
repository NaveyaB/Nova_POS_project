import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      is_active: body.is_active,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
