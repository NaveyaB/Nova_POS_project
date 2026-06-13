"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Eye, EyeOff, Loader2, EyeOffIcon } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-client"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error === "Invalid login credentials"
          ? "Invalid email or password"
          : data.error)
        return
      }

      if (data.session) {
        const supabase = createSupabaseBrowserClient()
        await supabase.auth.setSession(data.session)
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAccess = async () => {
    setDemoLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Demo access unavailable")
        return
      }

      if (data.session) {
        const supabase = createSupabaseBrowserClient()
        await supabase.auth.setSession(data.session)
      }

      toast.success("Exploring in demo mode")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NovaPOS</h1>
              <p className="text-sm text-gray-500">Inventory & Billing System</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                placeholder="admin@smartpos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 border-t pt-6">
            <p className="text-xs text-gray-500 mb-3 text-center">Or explore without an account</p>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleDemoAccess}
              disabled={demoLoading}
            >
              {demoLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Loading demo...</>
              ) : (
                <><EyeOff className="h-4 w-4" /> Demo Access (Read-Only)</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="flex h-full items-center justify-center p-12">
            <div className="text-center text-white">
              <ShoppingCart className="mx-auto h-24 w-24 mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">NovaPOS System</h2>
              <p className="text-lg text-blue-100 max-w-md">
                Complete Point of Sale solution with inventory management,
                billing, and real-time reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
