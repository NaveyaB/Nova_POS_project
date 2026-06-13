import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const DEMO_EMAIL = "demo@smartpos.com"
const DEMO_PASSWORD = "Demo@123456"

export async function POST() {
  const cookieStore = await cookies()

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  let { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })

  if (error) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (signUpError || !signUpData.user) {
      return NextResponse.json({
        error: "Demo user not available. Please create a demo user in Supabase Auth dashboard or sign in with your account.",
      }, { status: 400 })
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: signUpData.user.id,
      name: "Demo User",
      email: DEMO_EMAIL,
      phone: "0000000000",
      role: "demo",
      is_active: true,
    })

    if (profileError) {
      return NextResponse.json({ error: "Failed to create demo profile" }, { status: 500 })
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (signInError || !signInData.session) {
      return NextResponse.json({ error: "Demo login failed after signup" }, { status: 500 })
    }

    data = signInData
  } else {
    if (!data.user) {
      return NextResponse.json({ error: "Demo login failed" }, { status: 500 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (!profile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name: "Demo User",
        email: DEMO_EMAIL,
        phone: "0000000000",
        role: "demo",
        is_active: true,
      })
      if (profileError) {
        return NextResponse.json({ error: "Failed to create demo profile" }, { status: 500 })
      }
    } else if (profile.role !== "demo") {
      await supabase.from("profiles").update({ role: "demo" }).eq("id", data.user.id)
    }
  }

  const responseBody = NextResponse.json({ session: data.session, user: data.user })

  for (const cookie of response.cookies.getAll()) {
    responseBody.cookies.set(cookie.name, cookie.value, { ...cookie })
  }

  return responseBody
}
