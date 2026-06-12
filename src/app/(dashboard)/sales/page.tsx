"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Eye, Printer, RotateCcw, X, Download, Loader2, FileText } from "lucide-react"
import { Receipt, ReceiptActions } from "@/components/invoice/receipt"
import type { Sale } from "@/types"

type DateFilter = "all" | "today" | "weekly" | "monthly"

function getPaymentVariant(method: Sale["payment_method"]) {
  const map: Record<string, "default" | "success" | "warning" | "secondary"> = {
    cash: "success",
    upi: "default",
    card: "warning",
    net_banking: "secondary",
  }
  return map[method] || "default"
}

function getStatusVariant(status: Sale["status"]) {
  const map: Record<string, "success" | "destructive" | "warning"> = {
    completed: "success",
    refunded: "destructive",
    cancelled: "warning",
  }
  return map[status] || "default"
}

export default function SalesPage() {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [printSale, setPrintSale] = useState<Sale | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (dateFilter !== "all") params.set("dateFilter", dateFilter)
      const res = await fetch(`/api/sales${params.toString() ? `?${params.toString()}` : ""}`)
      if (!res.ok) throw new Error("Failed to fetch sales")
      const data = await res.json()
      setSales(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sales")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [search, dateFilter])

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  const dateFilters: { key: DateFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Average Order Value</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {dateFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDateFilter(f.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    dateFilter === f.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <SearchInput
              placeholder="Search by invoice or customer..."
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
              <Button variant="outline" className="mt-4" onClick={fetchSales}>
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                      <FileText className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">No sales found</p>
                    </TableCell>
                  </TableRow>
                ) : sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                    <TableCell>{sale.customer_name || "Walk-in"}</TableCell>
                    <TableCell className="text-gray-500">{formatDateTime(sale.created_at)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <Badge variant={getPaymentVariant(sale.payment_method)} className="capitalize">
                        {sale.payment_method.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sale.status)} className="capitalize">
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedSale(sale)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setPrintSale(sale)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        {sale.status === "completed" && (
                          <Button variant="ghost" size="icon">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSale} onOpenChange={(open) => { if (!open) setSelectedSale(null) }}>
        {selectedSale && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Invoice {selectedSale.invoice_number}</span>
                <Badge variant={getStatusVariant(selectedSale.status)} className="capitalize">
                  {selectedSale.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium">{selectedSale.customer_name || "Walk-in"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cashier</p>
                  <p className="font-medium">{selectedSale.user_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{formatDateTime(selectedSale.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment</p>
                  <Badge variant={getPaymentVariant(selectedSale.payment_method)} className="capitalize">
                    {selectedSale.payment_method.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {selectedSale?.items?.length > 0 && (
                <div className="border-t pt-3">
                  <p className="mb-2 text-sm font-medium text-gray-500">Items</p>
                  <div className="space-y-1.5">
                    {selectedSale.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <p className="mb-2 text-sm font-medium text-gray-500">Order Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-red-600">-{formatCurrency(selectedSale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatCurrency(selectedSale.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(selectedSale.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setPrintSale(selectedSale)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSale(null)}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!printSale} onOpenChange={(open) => { if (!open) setPrintSale(null) }}>
        {printSale && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invoice {printSale.invoice_number}</DialogTitle>
            </DialogHeader>
            <Receipt sale={printSale} />
            <ReceiptActions sale={printSale} onClose={() => setPrintSale(null)} />
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
