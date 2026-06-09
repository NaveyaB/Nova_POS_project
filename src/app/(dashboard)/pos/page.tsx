"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Minus, Trash2, Printer, Mail, CreditCard, Smartphone, Banknote, QrCode, User, Package, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePOSStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { generateInvoiceNumber } from "@/lib/invoice-utils"
import { Receipt, ReceiptActions } from "@/components/invoice/receipt"
import type { Sale, Product, Customer } from "@/types"

const categories = ["All", "Groceries", "Beverages", "Electronics", "Stationery", "Fashion"]

const paymentMethods = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "net_banking", label: "Net Banking", icon: QrCode },
] as const

export default function POSPage() {
  const { cart, customer, addToCart, removeFromCart, updateQuantity, clearCart, setCustomer } = usePOSStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [discount, setDiscount] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<"cash" | "upi" | "card" | "net_banking">("cash")
  const [customerId, setCustomerId] = useState("")
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products")
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()
      setProducts(data)
    } catch {
      toast.error("Failed to load products")
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers")
      if (!res.ok) throw new Error("Failed to fetch customers")
      const data = await res.json()
      setCustomers(data)
    } catch {
      toast.error("Failed to load customers")
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchCustomers()])
      setLoading(false)
    }
    load()
  }, [fetchProducts, fetchCustomers])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, products])

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0)
  }, [cart])

  const tax = useMemo(() => subtotal * 0.05, [subtotal])
  const grandTotal = useMemo(() => subtotal - discount + tax, [subtotal, discount, tax])

  const handleCustomerChange = (id: string) => {
    setCustomerId(id)
    const found = customers.find((c) => c.id === id)
    setCustomer(found ?? null)
  }

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    setSubmitting(true)

    const invoiceNumber = generateInvoiceNumber()

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          customer_id: customer?.id ?? null,
          subtotal,
          discount,
          tax,
          total: grandTotal,
          payment_method: selectedPayment,
          items: cart.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            gst_amount: item.gst_amount,
          })),
        }),
      })

      if (!res.ok) throw new Error("Failed to complete sale")

      const sale: Sale = await res.json()
      setCompletedSale(sale)
      toast.success(`Sale completed! Invoice: ${sale.invoice_number}`)
      clearCart()
      setDiscount(0)
      setCustomerId("")
      setSelectedPayment("cash")
    } catch {
      toast.error("Failed to complete sale. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
    <div className="flex h-[calc(100vh-5rem)] gap-0 -m-4 sm:-m-6">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b bg-white p-4">
          <SearchInput
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto border-b bg-white px-4 py-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="mb-2 h-12 w-12" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock_quantity < 10 && product.stock_quantity > 0
                const isOutOfStock = product.stock_quantity === 0
                return (
                  <Card
                    key={product.id}
                    className={`group cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                      isOutOfStock ? "cursor-not-allowed opacity-60" : ""
                    }`}
                    onClick={() => {
                      if (!isOutOfStock) addToCart(product)
                    }}
                  >
                    <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-4xl font-bold text-blue-400">
                      {product.name.charAt(0)}
                    </div>
                    <div className="space-y-1 p-3">
                      <div className="flex items-start justify-between gap-1">
                        <p className="line-clamp-1 text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        {isLowStock && (
                          <Badge variant="destructive" className="shrink-0 text-[10px]">
                            Low
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatCurrency(product.selling_price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {product.stock_quantity} {product.unit}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="hidden w-96 border-l bg-white lg:flex lg:flex-col xl:w-[420px]">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Customer</span>
          </div>
          <Select
            className="mt-2"
            placeholder="Walk-in Customer"
            value={customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            options={customers.map((c) => ({ value: c.id, label: `${c.name} - ${c.phone}` }))}
          />
          {customer && (
            <p className="mt-1 text-xs text-green-600">{customer.name} selected</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="mb-2 h-12 w-12" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Add items from the left panel</p>
            </div>
          ) : (
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                    {item.product_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-gray-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="flex h-7 w-8 items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-500">Discount</span>
              <div className="relative w-32">
                <input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="h-8 w-full rounded border border-gray-300 px-2 pr-7 text-right text-sm focus:border-blue-500 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ₹
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tax (5%)</span>
              <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-base">
              <span className="font-semibold text-gray-900">Grand Total</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">Payment Method</p>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedPayment(id)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                    selectedPayment === id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="success"
            size="lg"
            className="mt-4 w-full text-base font-semibold"
            onClick={handleCompleteSale}
            disabled={submitting}
          >
            {submitting ? "Processing..." : `Complete Sale (${formatCurrency(grandTotal)})`}
          </Button>

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={() => setShowPreview(true)}
              disabled={cart.length === 0}
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" disabled={cart.length === 0}>
              <Mail className="h-3.5 w-3.5" />
              Email Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>

      <Dialog open={!!completedSale} onOpenChange={(open) => { if (!open) setCompletedSale(null) }}>
        {completedSale && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invoice {completedSale.invoice_number}</DialogTitle>
            </DialogHeader>
            <Receipt sale={completedSale} />
            <ReceiptActions sale={completedSale} onClose={() => setCompletedSale(null)} />
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        {showPreview && cart.length > 0 && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Receipt Preview</DialogTitle>
            </DialogHeader>
            <Receipt
              sale={{
                id: "preview",
                invoice_number: generateInvoiceNumber(),
                customer_id: customer?.id,
                customer_name: customer?.name,
                user_id: "EMP001",
                user_name: "Naveya Admin",
                subtotal,
                discount,
                tax,
                total: grandTotal,
                payment_method: selectedPayment,
                status: "completed" as const,
                items: cart,
                created_at: new Date().toISOString(),
              }}
            />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
