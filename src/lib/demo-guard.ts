import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "./supabase-server"

export async function checkDemoAccess(): Promise<NextResponse | null> {
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

  if (profile?.role === "demo") {
    return NextResponse.json({ error: "Demo mode: Write operations are disabled" }, { status: 403 })
  }

  return null
}
