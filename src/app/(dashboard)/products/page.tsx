"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Edit, Trash2, Loader2, Package, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    brand: "",
    purchase_price: "",
    selling_price: "",
    stock_quantity: "",
    min_stock_level: "",
    gst_percentage: "",
    unit: "",
    category_id: "",
    description: "",
  })
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {})
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      if (categoryFilter) params.set("category", categoryFilter)

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to load products")
      const data = await res.json()
      setProducts(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, categoryFilter])

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const paginated = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (quantity <= minStock) return { label: "Low Stock", variant: "warning" as const }
    return { label: "In Stock", variant: "success" as const }
  }

  const openEditDialog = (product: any) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || "",
      brand: product.brand || "",
      purchase_price: String(product.purchase_price),
      selling_price: String(product.selling_price),
      stock_quantity: String(product.stock_quantity),
      min_stock_level: String(product.min_stock_level),
      gst_percentage: String(product.gst_percentage),
      unit: product.unit,
      category_id: product.category_id || "",
      description: product.description || "",
    })
  }

  const updateEditField = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setSaving(true)
    try {
      let image_url = editingProduct.image_url || ""

      if (editImageFile) {
        const uploadData = new FormData()
        uploadData.append("file", editImageFile)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData })
        if (!uploadRes.ok) throw new Error("Failed to upload image")
        const { url } = await uploadRes.json()
        if (url) image_url = url
      }

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          purchase_price: Number(editForm.purchase_price),
          selling_price: Number(editForm.selling_price),
          stock_quantity: Number(editForm.stock_quantity),
          min_stock_level: Number(editForm.min_stock_level),
          gst_percentage: Number(editForm.gst_percentage),
          image_url,
        }),
      })
      if (!res.ok) throw new Error("Failed to update product")
      toast.success("Product updated successfully")
      setEditingProduct(null)
      setEditImageFile(null)
      fetchProducts()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete product")
      toast.success("Product deleted")
      fetchProducts()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => router.push("/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchInput
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                placeholder="All Categories"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                options={categories.map((c: any) => ({ value: c.name, label: c.name }))}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-600">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="mb-3 h-12 w-12" />
              <p className="text-sm font-medium text-gray-900">No products found</p>
              <p className="mt-1 text-xs">Add your first product to get started</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push("/products/new")}>
                <Plus className="mr-1 h-4 w-4" />
                Add Product
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16 text-gray-400">
                        <Package className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm">No products match your search</p>
                      </TableCell>
                    </TableRow>
                  ) : paginated.map((product: any) => {
                    const status = getStatus(product.stock_quantity, product.min_stock_level)
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-sm font-semibold text-gray-600">
                              {product.name.charAt(0)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-gray-500">{product.sku}</TableCell>
                        <TableCell className="text-gray-500">{product.barcode || "-"}</TableCell>
                        <TableCell>{product.category_name || "-"}</TableCell>
                        <TableCell>{formatCurrency(product.selling_price)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, products.length)} of {products.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <Input required value={editForm.name} onChange={(e) => updateEditField("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <Input required value={editForm.sku} onChange={(e) => updateEditField("sku", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Barcode</label>
                <Input value={editForm.barcode} onChange={(e) => updateEditField("barcode", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select
                  value={editForm.category_id}
                  onChange={(e) => updateEditField("category_id", e.target.value)}
                  options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brand</label>
                <Input value={editForm.brand} onChange={(e) => updateEditField("brand", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Unit</label>
                <Input required value={editForm.unit} onChange={(e) => updateEditField("unit", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Purchase Price</label>
                <Input
                  required type="number" min="0" step="0.01"
                  value={editForm.purchase_price}
                  onChange={(e) => updateEditField("purchase_price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Selling Price</label>
                <Input
                  required type="number" min="0" step="0.01"
                  value={editForm.selling_price}
                  onChange={(e) => updateEditField("selling_price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                <Input
                  required type="number" min="0"
                  value={editForm.stock_quantity}
                  onChange={(e) => updateEditField("stock_quantity", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Stock Level</label>
                <Input
                  required type="number" min="0"
                  value={editForm.min_stock_level}
                  onChange={(e) => updateEditField("min_stock_level", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">GST %</label>
                <Input
                  type="number" min="0" step="0.01"
                  value={editForm.gst_percentage}
                  onChange={(e) => updateEditField("gst_percentage", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={editForm.description}
                  onChange={(e) => updateEditField("description", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Product Image</label>
              <div className="flex items-center gap-3">
                {editingProduct?.image_url && (
                  <Image
                    src={editingProduct.image_url}
                    alt="Current"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md object-cover"
                    unoptimized
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
