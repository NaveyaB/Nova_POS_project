"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Menu, Bell, LogOut } from "lucide-react"
import { MobileSidebar } from "./sidebar"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1" />
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs capitalize text-gray-500">{user?.role}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
    </>
  )
}
