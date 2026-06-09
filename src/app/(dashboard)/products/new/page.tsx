"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
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

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setCategoriesLoading(false))
  }, [])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let image_url = ""

      if (imageFile) {
        const uploadData = new FormData()
        uploadData.append("file", imageFile)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData })
        if (!uploadRes.ok) throw new Error("Failed to upload image")
        const { url } = await uploadRes.json()
        image_url = url
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          purchase_price: Number(form.purchase_price),
          selling_price: Number(form.selling_price),
          stock_quantity: Number(form.stock_quantity),
          min_stock_level: Number(form.min_stock_level),
          gst_percentage: Number(form.gst_percentage),
          image_url,
        }),
      })

      if (!res.ok) throw new Error("Failed to create product")

      toast.success("Product created successfully")
      router.push("/products")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
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
                {categoriesLoading ? (
                  <div className="flex h-10 items-center text-sm text-gray-400">Loading categories...</div>
                ) : (
                  <Select
                    required
                    placeholder="Select category"
                    value={form.category_id}
                    onChange={(e) => updateField("category_id", e.target.value)}
                    options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                  />
                )}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Product Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
