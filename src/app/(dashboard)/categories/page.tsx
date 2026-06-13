"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchInput } from "@/components/ui/search-input"
import { toast } from "sonner"
import { formatDate, fetchWithTimeout } from "@/lib/utils"
import type { Category, Product } from "@/types"
import { DemoGuard } from "@/components/ui/demo-guard"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)

  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of products) {
      if (p.category_id) {
        map[p.category_id] = (map[p.category_id] || 0) + 1
      }
    }
    return map
  }, [products])

  const abortRef = useRef<AbortController | null>(null)

  const fetchCategories = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const [catRes, prodRes] = await Promise.all([
        fetchWithTimeout("/api/categories", { signal, timeout: 10000 }),
        fetchWithTimeout("/api/products", { signal, timeout: 10000 }),
      ])
      if (!catRes.ok) throw new Error("Failed to load categories")
      const catData = await catRes.json()
      if (!signal?.aborted) setCategories(Array.isArray(catData) ? catData : catData.data ?? [])
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        if (!signal?.aborted) setProducts(Array.isArray(prodData) ? prodData : prodData.data ?? [])
      }
    } catch {
      if (signal?.aborted) return
      toast.error("Failed to load categories")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller
    fetchCategories(controller.signal)
    return () => controller.abort()
  }, [fetchCategories])

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  )

  const openAddDialog = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || "" })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) return
    setSaving(true)
    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error("Failed to update")
        toast.success("Category updated")
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error("Failed to create")
        toast.success("Category created")
      }
      setDialogOpen(false)
      await fetchCategories()
    } catch {
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Category deleted")
      await fetchCategories()
    } catch {
      toast.error("Failed to delete category")
    }
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <DemoGuard>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </DemoGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <SearchInput
              placeholder="Search categories..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products Count</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-500">{category.description || "-"}</TableCell>
                    <TableCell>{productCountMap[category.id] || 0}</TableCell>
                    <TableCell>{formatDate(category.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DemoGuard>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DemoGuard>
                        <DemoGuard>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </DemoGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                required
                placeholder="Category name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input
                placeholder="Category description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name || saving}>
                {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
