import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { checkDemoAccess } from "@/lib/demo-guard"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description, created_at, updated_at")
    .order("name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const guard = await checkDemoAccess(); if (guard) return guard
  const supabase = await createSupabaseServerClient()
  const body = await request.json()

  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: body.name, description: body.description || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
