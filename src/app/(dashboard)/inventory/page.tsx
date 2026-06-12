"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Package, Plus, Minus, AlertTriangle, Loader2, Edit, Trash2 } from "lucide-react"
import type { Product } from "@/types"

type Tab = "overview" | "stock-in" | "stock-out" | "alerts"

function getStatus(product: Product) {
  if (product.stock_quantity === 0) return { label: "Out of Stock", variant: "destructive" as const }
  if (product.stock_quantity < product.min_stock_level) return { label: "Low Stock", variant: "warning" as const }
  return { label: "In Stock", variant: "success" as const }
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/products")
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity < p.min_stock_level
  )
  const outOfStockProducts = products.filter((p) => p.stock_quantity === 0)

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Stock Overview" },
    { key: "stock-in", label: "Stock In" },
    { key: "stock-out", label: "Stock Out" },
    { key: "alerts", label: "Alerts" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Stock Overview</CardTitle>
              <SearchInput
                placeholder="Search products..."
                value={search}
                onChange={setSearch}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-red-600">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchProducts}>
                  Retry
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock Quantity</TableHead>
                    <TableHead>Min Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getStatus(product)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-gray-500">{product.sku}</TableCell>
                        <TableCell>{product.stock_quantity} {product.unit}</TableCell>
                        <TableCell>{product.min_stock_level} {product.unit}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <UpdateStockButton product={product} onUpdate={fetchProducts} />
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "stock-in" && <StockForm type="in" products={products} onUpdate={fetchProducts} />}
      {activeTab === "stock-out" && <StockForm type="out" products={products} onUpdate={fetchProducts} />}

      {activeTab === "alerts" && (
        <div className="space-y-6">
          {outOfStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {outOfStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4"
                  >
                    <div>
                      <p className="font-medium text-red-900">{product.name}</p>
                      <p className="text-sm text-red-700">SKU: {product.sku}</p>
                    </div>
                    <Badge variant="destructive">0 Available</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {lowStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                  >
                    <div>
                      <p className="font-medium text-yellow-900">{product.name}</p>
                      <p className="text-sm text-yellow-700">Min Level: {product.min_stock_level} {product.unit}</p>
                    </div>
                    <Badge variant="warning">Only {product.stock_quantity} Left</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-lg font-medium">All Stock Levels Normal</p>
                <p className="text-sm">No alerts at this time</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete product")
      toast.success("Product deleted")
      fetchProducts()
    } catch {
      toast.error("Failed to delete product")
    }
  }
}

function UpdateStockButton({ product, onUpdate }: { product: Product; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"in" | "out">("in")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quantity || !reason) {
      toast.error("Please fill all fields")
      return
    }
    const qty = Number(quantity)
    if (qty <= 0) {
      toast.error("Quantity must be positive")
      return
    }
    if (type === "out" && qty > product.stock_quantity) {
      toast.error("Insufficient stock")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, type, quantity: qty, reason }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update stock")
      }
      toast.success("Stock updated successfully")
      setOpen(false)
      setQuantity("")
      setReason("")
      onUpdate()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Package className="h-4 w-4 mr-1" />
        Stock
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {product.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("in")}
                className={`flex-1 rounded-lg border p-2 text-sm font-medium ${
                  type === "in" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"
                }`}
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                Stock In
              </button>
              <button
                type="button"
                onClick={() => setType("out")}
                className={`flex-1 rounded-lg border p-2 text-sm font-medium ${
                  type === "out" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-500"
                }`}
              >
                <Minus className="h-4 w-4 mx-auto mb-1" />
                Stock Out
              </button>
            </div>
            <p className="text-sm text-gray-500">Current Stock: {product.stock_quantity} {product.unit}</p>
            <Input
              type="number"
              min="1"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <Input
              placeholder="Reason (e.g. restock, damaged)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <Button type="submit" disabled={submitting} variant={type === "in" ? "default" : "destructive"} className="w-full">
              {submitting ? "Updating..." : `${type === "in" ? "Add" : "Remove"} Stock`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function StockForm({ type, products, onUpdate }: { type: "in" | "out"; products: Product[]; onUpdate: () => void }) {
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku}) — Stock: ${p.stock_quantity}`,
  }))

  const selectedProduct = products.find((p) => p.id === productId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!productId || !quantity || !reason) {
      setMessage("Please fill all fields")
      return
    }
    const qty = Number(quantity)
    if (qty <= 0) {
      setMessage("Quantity must be positive")
      return
    }
    if (type === "out" && selectedProduct && qty > selectedProduct.stock_quantity) {
      setMessage("Insufficient stock")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          type,
          quantity: qty,
          reason,
          reference: date,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to record movement")
      }

      toast.success(`${type === "in" ? "Stock In" : "Stock Out"} recorded successfully`)
      setProductId("")
      setQuantity("")
      setReason("")
      onUpdate()
    } catch (err: any) {
      setMessage(err.message)
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "in" ? (
            <><Plus className="h-5 w-5 text-green-600" /> Stock In</>
          ) : (
            <><Minus className="h-5 w-5 text-red-600" /> Stock Out</>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product</label>
            <Select
              options={productOptions}
              placeholder="Select a product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <Input
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <Input
              placeholder="e.g. Supplier restock, damaged, expiry"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button type="submit" variant={type === "in" ? "default" : "destructive"} disabled={submitting}>
            {submitting ? "Processing..." : type === "in" ? "Add Stock" : "Remove Stock"}
          </Button>

          {message && (
            <p
              className={`text-sm ${
                message.includes("successfully") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
