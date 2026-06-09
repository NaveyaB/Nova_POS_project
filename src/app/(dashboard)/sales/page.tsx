"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockSales } from "@/lib/mock-data"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Eye, Printer, RotateCcw, X } from "lucide-react"
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

function isWithinRange(dateStr: string, filter: DateFilter) {
  const date = new Date(dateStr)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (filter === "today") {
    return date >= startOfDay
  }
  if (filter === "weekly") {
    const weekAgo = new Date(startOfDay)
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date >= weekAgo
  }
  if (filter === "monthly") {
    const monthAgo = new Date(startOfDay)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return date >= monthAgo
  }
  return true
}

export default function SalesPage() {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filteredSales = useMemo(() => {
    return mockSales.filter((sale) => {
      const matchesSearch =
        sale.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        (sale.customer_name || "").toLowerCase().includes(search.toLowerCase())
      const matchesDate = isWithinRange(sale.created_at, dateFilter)
      return matchesSearch && matchesDate
    })
  }, [search, dateFilter])

  const totalSales = filteredSales.length
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0)
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
              {filteredSales.map((sale) => (
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
                      <Button variant="ghost" size="icon">
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
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <p className="text-gray-500">Payment Method</p>
                  <Badge variant={getPaymentVariant(selectedSale.payment_method)} className="capitalize">
                    {selectedSale.payment_method.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="mb-2 text-sm font-medium text-gray-500">Order Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-red-600">-{formatCurrency(selectedSale.discount)}</span>
                  </div>
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
                <Button variant="outline" size="sm">
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
    </div>
  )
}
