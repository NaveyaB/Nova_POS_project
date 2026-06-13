"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "./store"
import { createSupabaseBrowserClient } from "./supabase-client"

const publicRoutes = ["/login"]
const AUTH_TIMEOUT = 5000

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setUser, setIsDemo, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    const supabase = createSupabaseBrowserClient()

    const timeoutId = setTimeout(() => {
      if (!cancelled) { setIsLoading(false); setInitialized(true) }
    }, AUTH_TIMEOUT)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          if (!cancelled && profile) {
            const isDemo = (profile as any).role === "demo"
            setUser({
              id: (profile as any).id,
              email: (profile as any).email,
              name: (profile as any).name,
              role: isDemo ? "admin" : (profile as any).role,
              phone: (profile as any).phone || undefined,
              created_at: (profile as any).created_at,
            })
            setIsDemo(isDemo)
          }
        }
        if (!cancelled) { setIsLoading(false); setInitialized(true) }
        clearTimeout(timeoutId)
      })
      .catch(() => {
        if (!cancelled) { setIsLoading(false); setInitialized(true) }
        clearTimeout(timeoutId)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      if (event === "SIGNED_OUT") {
        setIsDemo(false)
        logout()
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        if (!cancelled && profile) {
          const isDemo = (profile as any).role === "demo"
          setUser({
            id: (profile as any).id,
            email: (profile as any).email,
            name: (profile as any).name,
            role: isDemo ? "admin" : (profile as any).role,
            phone: (profile as any).phone || undefined,
            created_at: (profile as any).created_at,
          })
          setIsDemo(isDemo)
        }
      }
    })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [setUser, setIsDemo, logout, router])

  useEffect(() => {
    if (!initialized) return
    const isPublic = publicRoutes.some((r) => pathname.startsWith(r))
    if (!user && !isPublic) {
      router.replace("/login")
    }
  }, [user, initialized, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
