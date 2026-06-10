"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Plus, Minus, Trash2, Printer, Mail, CreditCard, Smartphone, Banknote, QrCode, User, Package, Loader2, ShoppingCart, Scan, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePOSStore } from "@/lib/store"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Receipt, ReceiptActions } from "@/components/invoice/receipt"
import type { Sale, SaleItem, Product, Customer } from "@/types"

const categories = ["All", "Groceries", "Beverages", "Electronics", "Stationery", "Fashion"]

const paymentMethods = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "net_banking", label: "Net Banking", icon: QrCode },
] as const

export default function POSPage() {
  const { cart, customer, addToCart, removeFromCart, updateQuantity, clearCart, setCustomer, restoreCart } = usePOSStore()

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
  const [showMobileCart, setShowMobileCart] = useState(false)
  const [barcodeQuery, setBarcodeQuery] = useState("")
  const barcodeInputRef = useRef<HTMLInputElement>(null)

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
    restoreCart()
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchCustomers()])
      setLoading(false)
    }
    load()
  }, [fetchProducts, fetchCustomers, restoreCart])

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

  const handleBarcodeSearch = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(barcode)}`)
      if (!res.ok) return
      const data: Product[] = await res.json()
      const match = data.find((p) => p.barcode === barcode)
      if (match) {
        if (match.stock_quantity <= 0) {
          toast.error(`${match.name} is out of stock`)
          return
        }
        addToCart(match)
        toast.success(`${match.name} added to cart`)
        setBarcodeQuery("")
      } else {
        toast.error("Product not found with this barcode")
      }
    } catch {
      toast.error("Failed to search barcode")
    }
  }, [addToCart])

  useEffect(() => {
    if (barcodeQuery.length >= 4) {
      const timer = setTimeout(() => handleBarcodeSearch(barcodeQuery), 400)
      return () => clearTimeout(timer)
    }
  }, [barcodeQuery, handleBarcodeSearch])

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

    for (const item of cart) {
      if (item.price <= 0) {
        toast.error(`${item.product_name} has zero price. Remove or fix it.`)
        return
      }
      if (item.quantity <= 0) {
        toast.error(`${item.product_name} has invalid quantity.`)
        return
      }
    }

    const seen = new Set<string>()
    for (const item of cart) {
      if (seen.has(item.product_id)) {
        toast.error(`Duplicate entry for ${item.product_name}`)
        return
      }
      seen.add(item.product_id)
    }

    if (grandTotal <= 0) {
      toast.error("Sale total must be greater than zero")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        <div className="space-y-2 border-b bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchInput
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            <button
              onClick={() => barcodeInputRef.current?.focus()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50"
              title="Scan barcode"
            >
              <Scan className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Scan className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan or type barcode..."
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-8 text-sm focus:border-blue-500 focus:outline-none"
              />
              {barcodeQuery && (
                <button
                  onClick={() => setBarcodeQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
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

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white p-3 lg:hidden">
            <button
              onClick={() => setShowMobileCart(true)}
              className="flex w-full items-center justify-between rounded-lg bg-blue-600 px-4 py-3 text-white"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ShoppingCart className="h-4 w-4" />
                {cart.length} item{cart.length > 1 ? "s" : ""}
              </span>
              <span className="text-sm font-bold">{formatCurrency(grandTotal)}</span>
            </button>
          </div>
        )}
      </div>

      <div className="hidden w-96 border-l bg-white lg:flex lg:flex-col xl:w-[420px]">
        <CartPanel
          cart={cart}
          customer={customer}
          customers={customers}
          customerId={customerId}
          handleCustomerChange={handleCustomerChange}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          subtotal={subtotal}
          discount={discount}
          setDiscount={setDiscount}
          tax={tax}
          grandTotal={grandTotal}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          submitting={submitting}
          handleCompleteSale={handleCompleteSale}
          setShowPreview={setShowPreview}
        />
      </div>

      {showMobileCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white">
            <div className="sticky top-0 border-b bg-white p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Cart ({cart.length})</h3>
                <button onClick={() => setShowMobileCart(false)} className="rounded-full p-1 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <CartPanel
              cart={cart}
              customer={customer}
              customers={customers}
              customerId={customerId}
              handleCustomerChange={handleCustomerChange}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              subtotal={subtotal}
              discount={discount}
              setDiscount={setDiscount}
              tax={tax}
              grandTotal={grandTotal}
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              submitting={submitting}
              handleCompleteSale={handleCompleteSale}
              setShowPreview={setShowPreview}
            />
          </div>
        </div>
      )}
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
                invoice_number: "PREVIEW",
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

function CartPanel({
  cart, customer, customers, customerId, handleCustomerChange,
  updateQuantity, removeFromCart, subtotal, discount, setDiscount,
  tax, grandTotal, selectedPayment, setSelectedPayment,
  submitting, handleCompleteSale, setShowPreview,
}: {
  cart: SaleItem[]; customer: Customer | null; customers: Customer[]; customerId: string;
  handleCustomerChange: (id: string) => void; updateQuantity: (pid: string, qty: number) => void;
  removeFromCart: (pid: string) => void; subtotal: number; discount: number;
  setDiscount: (n: number) => void; tax: number; grandTotal: number;
  selectedPayment: string; setSelectedPayment: (p: "cash" | "upi" | "card" | "net_banking") => void;
  submitting: boolean; handleCompleteSale: () => void; setShowPreview: (v: boolean) => void;
}) {
  return (
    <>
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
                    onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
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
    </>
  )
}
