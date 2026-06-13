"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchInput } from "@/components/ui/search-input"
import { toast } from "sonner"
import { fetchWithTimeout } from "@/lib/utils"
import { Building2, FileCheck, Pencil, Trash2, Plus } from "lucide-react"
import type { Supplier } from "@/types"
import { DemoGuard } from "@/components/ui/demo-guard"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", gst_number: "" })
  const [saving, setSaving] = useState(false)

  const fetchSuppliers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const res = await fetchWithTimeout("/api/suppliers", { signal, timeout: 10000 })
      if (!res.ok) throw new Error("Failed to load suppliers")
      const data = await res.json()
      if (!signal?.aborted) setSuppliers(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      if (signal?.aborted) return
      toast.error("Failed to load suppliers")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchSuppliers(controller.signal)
    return () => controller.abort()
  }, [fetchSuppliers])

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers
    const q = search.toLowerCase()
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.gst_number?.toLowerCase().includes(q)
    )
  }, [suppliers, search])

  const stats = useMemo(
    () => ({
      total: suppliers.length,
      withGst: suppliers.filter((s) => s.gst_number).length,
    }),
    [suppliers]
  )

  const openAddDialog = () => {
    setEditingSupplier(null)
    setFormData({ name: "", phone: "", email: "", address: "", gst_number: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
      gst_number: supplier.gst_number || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (supplier: Supplier) => {
    if (!window.confirm(`Are you sure you want to delete ${supplier.name}?`)) return
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Supplier deleted")
      await fetchSuppliers()
    } catch {
      toast.error("Failed to delete supplier")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingSupplier) {
        const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error("Failed to update")
        toast.success("Supplier updated")
      } else {
        const res = await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error("Failed to create")
        toast.success("Supplier created")
      }
      setDialogOpen(false)
      await fetchSuppliers()
    } catch {
      toast.error(editingSupplier ? "Failed to update supplier" : "Failed to create supplier")
    } finally {
      setSaving(false)
    }
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500 p-2">
                <Building2 className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-500 p-2">
                <FileCheck className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stats.withGst}</p>
            <p className="text-sm text-gray-500">GST Registered</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput placeholder="Search suppliers..." value={search} onChange={setSearch} />
        <DemoGuard>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </DemoGuard>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone || "\u2014"}</TableCell>
                    <TableCell>{supplier.email || "\u2014"}</TableCell>
                    <TableCell>{supplier.address || "\u2014"}</TableCell>
                    <TableCell>
                      {supplier.gst_number ? (
                        <Badge variant="outline">{supplier.gst_number}</Badge>
                      ) : (
                        "\u2014"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DemoGuard>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(supplier)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DemoGuard>
                        <DemoGuard>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DemoGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier Name</label>
              <Input
                placeholder="Supplier name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <Input
                placeholder="GST number"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingSupplier ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
