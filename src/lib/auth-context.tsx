"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "./store"
import { createSupabaseBrowserClient } from "./supabase-client"

const publicRoutes = ["/login"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setUser, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        if (profile) {
          setUser({
            id: (profile as any).id,
            email: (profile as any).email,
            name: (profile as any).name,
            role: (profile as any).role,
            phone: (profile as any).phone || undefined,
            created_at: (profile as any).created_at,
          })
        }
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        logout()
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        if (profile) {
          setUser({
            id: (profile as any).id,
            email: (profile as any).email,
            name: (profile as any).name,
            role: (profile as any).role,
            phone: (profile as any).phone || undefined,
            created_at: (profile as any).created_at,
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, logout, router])

  useEffect(() => {
    if (isLoading) return
    const isPublic = publicRoutes.some((r) => pathname.startsWith(r))
    if (!user && !isPublic) {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
