"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { mockCategories } from "@/lib/mock-data"
import { toast } from "sonner"

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    description: "",
    barcode: "",
    sku: "",
    category_id: "",
    brand: "",
    purchase_price: "",
    selling_price: "",
    stock_quantity: "",
    min_stock_level: "",
    gst_percentage: "",
    unit: "",
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Product created successfully")
    router.push("/products")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <Input
                  required
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <Input
                  required
                  placeholder="Enter SKU"
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Barcode</label>
                <Input
                  placeholder="Enter barcode"
                  value={form.barcode}
                  onChange={(e) => updateField("barcode", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select
                  required
                  placeholder="Select category"
                  value={form.category_id}
                  onChange={(e) => updateField("category_id", e.target.value)}
                  options={mockCategories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brand</label>
                <Input
                  placeholder="Enter brand"
                  value={form.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Unit</label>
                <Input
                  required
                  placeholder="e.g. Pcs, Kg, Ltr"
                  value={form.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Purchase Price</label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.purchase_price}
                  onChange={(e) => updateField("purchase_price", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Selling Price</label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.selling_price}
                  onChange={(e) => updateField("selling_price", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                <Input
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock_quantity}
                  onChange={(e) => updateField("stock_quantity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Stock Level</label>
                <Input
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.min_stock_level}
                  onChange={(e) => updateField("min_stock_level", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">GST %</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.gst_percentage}
                  onChange={(e) => updateField("gst_percentage", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Enter description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Create Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
