"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  Truck,
  BarChart3,
  Settings,
  UserCircle,
  Tags,
  FileText,
} from "lucide-react"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "cashier", "manager"] },
  { href: "/pos", label: "POS Billing", icon: ShoppingCart, roles: ["admin", "cashier"] },
  { href: "/products", label: "Products", icon: Package, roles: ["admin", "manager"] },
  { href: "/categories", label: "Categories", icon: Tags, roles: ["admin", "manager"] },
  { href: "/inventory", label: "Inventory", icon: ClipboardList, roles: ["admin", "manager"] },
  { href: "/sales", label: "Sales", icon: FileText, roles: ["admin", "cashier", "manager"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["admin", "cashier", "manager"] },
  { href: "/suppliers", label: "Suppliers", icon: Truck, roles: ["admin", "manager"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "manager"] },
  { href: "/employees", label: "Employees", icon: UserCircle, roles: ["admin"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <ShoppingCart className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">SmartPOS</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  if (!open) return null

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">SmartPOS</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}
