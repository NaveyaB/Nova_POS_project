"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "./store"
import { mockUsers } from "./mock-data"

const publicRoutes = ["/login"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const isLoading = useAuthStore((s) => s.isLoading)
  const setLoading = useAuthStore((s) => s.setLoading)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const stored = localStorage.getItem("pos_user")
    if (stored) {
      const u = JSON.parse(stored)
      const found = mockUsers.find((mu) => mu.email === u.email)
      if (found) setUser(found)
    }
    setLoading(false)
  }, [setUser, setLoading])

  useEffect(() => {
    if (isLoading) return
    const isPublic = publicRoutes.some((r) => pathname.startsWith(r))
    if (!user && !isPublic) {
      router.push("/login")
    }
    if (user && isPublic) {
      router.push("/")
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
