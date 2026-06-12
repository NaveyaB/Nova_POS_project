"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { DollarSign, TrendingUp, ShoppingCart, Wallet, Package, AlertTriangle, CheckCircle, Users, Repeat, Award } from "lucide-react"
import type { Sale, Product, Customer } from "@/types"

type Tab = "sales" | "inventory" | "customer"
type Period = "today" | "weekly" | "monthly" | "yearly" | "custom"

const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444"]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sales")
  const [period, setPeriod] = useState<Period>("monthly")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [salesRes, productsRes, customersRes] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/products"),
          fetch("/api/customers"),
        ])
        if (!salesRes.ok || !productsRes.ok || !customersRes.ok) {
          throw new Error("Failed to fetch report data")
        }
        const [salesData, productsData, customersData] = await Promise.all([
          salesRes.json(),
          productsRes.json(),
          customersRes.json(),
        ])
        setSales(salesData)
        setProducts(productsData)
        setCustomers(customersData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredSales = useMemo(() => {
    const now = new Date()
    const yearStr = String(now.getFullYear())
    const monthStr = `${yearStr}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const todayStr = `${yearStr}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    return sales.filter((sale) => {
      const saleDate = sale.created_at.split("T")[0]
      switch (period) {
        case "today":
          return saleDate === todayStr
        case "weekly": {
          const d = new Date(saleDate)
          const ref = new Date(todayStr)
          const weekStart = new Date(ref)
          weekStart.setDate(ref.getDate() - ref.getDay() + (ref.getDay() === 0 ? -6 : 1))
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return d >= weekStart && d <= weekEnd
        }
        case "monthly":
          return saleDate.startsWith(monthStr)
        case "yearly":
          return saleDate.startsWith(yearStr)
        case "custom":
          if (!customStart && !customEnd) return true
          if (customStart && saleDate < customStart) return false
          if (customEnd && saleDate > customEnd) return false
          return true
        default:
          return true
      }
    })
  }, [sales, period, customStart, customEnd])

  const revenue = useMemo(() => filteredSales.reduce((sum, s) => sum + s.total, 0), [filteredSales])
  const orders = filteredSales.length
  const profit = revenue * 0.3
  const avgOrderValue = orders > 0 ? revenue / orders : 0

  const dailySalesData = useMemo(() => {
    switch (period) {
      case "today":
        return [
          { label: "9 AM", amount: 0 },
          { label: "10 AM", amount: 158 },
          { label: "11 AM", amount: 0 },
          { label: "12 PM", amount: 336 },
          { label: "1 PM", amount: 0 },
          { label: "2 PM", amount: 535 },
          { label: "3 PM", amount: 0 },
          { label: "4 PM", amount: 0 },
          { label: "5 PM", amount: 0 },
          { label: "6 PM", amount: 0 },
        ]
      case "weekly":
        return [
          { label: "Mon", amount: 535 },
          { label: "Tue", amount: 336 },
          { label: "Wed", amount: 158 },
          { label: "Thu", amount: 720 },
          { label: "Fri", amount: 980 },
          { label: "Sat", amount: 1250 },
          { label: "Sun", amount: 0 },
        ]
      case "monthly":
        return [
          { label: "Week 1", amount: 1029 },
          { label: "Week 2", amount: 2150 },
          { label: "Week 3", amount: 1800 },
          { label: "Week 4", amount: 2400 },
        ]
      case "yearly":
        return [
          { label: "Jan", amount: 250000 },
          { label: "Feb", amount: 280000 },
          { label: "Mar", amount: 220000 },
          { label: "Apr", amount: 320000 },
          { label: "May", amount: 350000 },
          { label: "Jun", amount: 300000 },
          { label: "Jul", amount: 0 },
          { label: "Aug", amount: 0 },
          { label: "Sep", amount: 0 },
          { label: "Oct", amount: 0 },
          { label: "Nov", amount: 0 },
          { label: "Dec", amount: 0 },
        ]
      case "custom":
        return [
          { label: "01 Jun", amount: 535 },
          { label: "02 Jun", amount: 336 },
          { label: "03 Jun", amount: 158 },
        ]
      default:
        return []
    }
  }, [period])

  const monthlyData = [
    { month: "Jan", revenue: 250000, profit: 75000 },
    { month: "Feb", revenue: 280000, profit: 84000 },
    { month: "Mar", revenue: 220000, profit: 66000 },
    { month: "Apr", revenue: 320000, profit: 96000 },
    { month: "May", revenue: 350000, profit: 105000 },
    { month: "Jun", revenue: 300000, profit: 90000 },
  ]

  const inventoryData = useMemo(() => {
    const inStock = products.filter((p) => p.stock_quantity > p.min_stock_level).length
    const lowStock = products.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level
    ).length
    const outOfStock = products.filter((p) => p.stock_quantity === 0).length
    const stockValue = products.reduce(
      (sum, p) => sum + p.purchase_price * p.stock_quantity,
      0
    )
    return { inStock, lowStock, outOfStock, stockValue }
  }, [products])

  const inventoryChartData = [
    { name: "In Stock", value: inventoryData.inStock },
    { name: "Low Stock", value: inventoryData.lowStock },
    { name: "Out of Stock", value: inventoryData.outOfStock },
  ]

  const topCustomers = useMemo(
    () => [...customers].sort((a, b) => b.loyalty_points - a.loyalty_points),
    [customers]
  )

  const repeatCustomers = useMemo(() => {
    const counts: Record<string, number> = {}
    sales.forEach((s) => {
      if (s.customer_id) counts[s.customer_id] = (counts[s.customer_id] || 0) + 1
    })
    return Object.values(counts).filter((c) => c > 1).length
  }, [sales])

  const periods: { value: Period; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "custom", label: "Custom Date" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {([
          { value: "sales", label: "Sales Reports" },
          { value: "inventory", label: "Inventory Reports" },
          { value: "customer", label: "Customer Reports" },
        ] as { value: Tab; label: string }[]).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Start Date</label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">End Date</label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-blue-500 p-2">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-green-500 p-2">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(profit)}</p>
                <p className="text-sm text-gray-500">Profit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-purple-500 p-2">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{orders}</p>
                <p className="text-sm text-gray-500">Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-yellow-500 p-2">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
                <p className="text-sm text-gray-500">Average Order Value</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Daily Sales
                  {period !== "today" && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({period.charAt(0).toUpperCase() + period.slice(1)})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue vs Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-blue-500 p-2">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">
                  {formatCurrency(inventoryData.stockValue)}
                </p>
                <p className="text-sm text-gray-500">Stock Value</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-green-500 p-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{inventoryData.inStock}</p>
                <p className="text-sm text-gray-500">In Stock</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-yellow-500 p-2">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{inventoryData.lowStock}</p>
                <p className="text-sm text-gray-500">Low Stock</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-red-500 p-2">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{inventoryData.outOfStock}</p>
                <p className="text-sm text-gray-500">Out of Stock</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={inventoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry: { name?: string; percent?: number }) =>
                      `${entry.name} ${((entry.percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {inventoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "customer" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-blue-500 p-2">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{customers.length}</p>
                <p className="text-sm text-gray-500">Total Customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-green-500 p-2">
                    <Repeat className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{repeatCustomers}</p>
                <p className="text-sm text-gray-500">Repeat Customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-yellow-500 p-2">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">
                  {customers.reduce((s, c) => s + c.loyalty_points, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Loyalty Points</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.phone || customer.email}</p>
                      </div>
                    </div>
                    <Badge variant="warning">{customer.loyalty_points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
