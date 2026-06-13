"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Menu, Bell, LogOut, User, X, Loader2 } from "lucide-react"
import { MobileSidebar } from "./sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isDemo = useAuthStore((s) => s.isDemo)
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    router.push("/login")
    router.refresh()
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
        {isDemo && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Demo Mode
          </span>
        )}
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 rounded-lg p-1 hover:bg-gray-100"
          >
            <div className="text-right max-sm:hidden">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs capitalize text-gray-500">
                {isDemo ? "Demo" : user?.role}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}

function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const user = useAuthStore((s) => s.user)
  const isDemo = useAuthStore((s) => s.isDemo)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "" })

  const openEdit = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "" })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone || undefined,
        created_at: data.created_at,
      })
      toast.success("Profile updated")
      setEditing(false)
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your profile? This action cannot be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch("/api/profile", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Profile deleted")
      await logout()
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("Failed to delete profile")
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs capitalize text-gray-400">{isDemo ? "Demo User" : user?.role}</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-900">{user?.phone || "Not set"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Joined</span>
                <span className="text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
            {!isDemo && (
              <div className="flex justify-between gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={openEdit}>
                  Edit Profile
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Profile"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
