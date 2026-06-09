"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { mockUsers } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [remember, setRemember] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const found = mockUsers.find((u) => u.email === email)
    if (!found) {
      setError("Invalid email or password")
      return
    }

    if (password !== "password") {
      setError("Invalid email or password")
      return
    }

    setUser(found)
    if (remember) {
      localStorage.setItem("pos_user", JSON.stringify({ email }))
    }
    router.push("/")
  }

  const fillCredentials = (role: string) => {
    const u = mockUsers.find((mu) => mu.role === role)
    if (u) {
      setEmail(u.email)
      setPassword("password")
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
              <h1 className="text-2xl font-bold text-gray-900">SmartPOS</h1>
              <p className="text-sm text-gray-500">Inventory & Billing System</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@smartpos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Remember Me
              </label>
              <button type="button" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-8 border-t pt-6">
            <p className="text-xs text-gray-500 mb-3 text-center">Quick Login (Password: password)</p>
            <div className="flex gap-2">
              <button
                onClick={() => fillCredentials("admin")}
                className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                Naveya (Admin)
              </button>
              <button
                onClick={() => fillCredentials("manager")}
                className="flex-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100"
              >
                Karthik (Manager)
              </button>
              <button
                onClick={() => fillCredentials("cashier")}
                className="flex-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
              >
                Meena (Cashier)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="flex h-full items-center justify-center p-12">
            <div className="text-center text-white">
              <ShoppingCart className="mx-auto h-24 w-24 mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">SmartPOS System</h2>
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
