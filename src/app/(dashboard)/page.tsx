"use client"

import { useState, useEffect } from "react"
import type { DashboardStats } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, AlertTriangle, Users, ShoppingCart, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const dailySales = [
  { day: "Mon", amount: 18500 },
  { day: "Tue", amount: 22000 },
  { day: "Wed", amount: 16800 },
  { day: "Thu", amount: 24500 },
  { day: "Fri", amount: 28000 },
  { day: "Sat", amount: 32500 },
  { day: "Sun", amount: 21000 },
]

const monthlyRevenue = [
  { month: "Jan", revenue: 320000, profit: 96000 },
  { month: "Feb", revenue: 285000, profit: 85500 },
  { month: "Mar", revenue: 410000, profit: 123000 },
  { month: "Apr", revenue: 378000, profit: 113400 },
  { month: "May", revenue: 452000, profit: 135600 },
  { month: "Jun", revenue: 482300, profit: 144690 },
]

const topProducts = [
  { name: "Aavin Milk 500ml", sales: 450 },
  { name: "Coca Cola 750ml", sales: 380 },
  { name: "Dairy Milk Silk", sales: 320 },
  { name: "India Gate Rice 5kg", sales: 280 },
  { name: "Lux Soap", sales: 250 },
]

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

const recentActivities = [
  { id: "1", text: "Invoice #INV1005 Created", time: "2 min ago", type: "sale" },
  { id: "2", text: "Product \"Wireless Mouse\" Updated", time: "15 min ago", type: "update" },
  { id: "3", text: "New Customer Added: Priya S", time: "1 hour ago", type: "customer" },
  { id: "4", text: "Stock Added: Aavin Milk +50", time: "2 hours ago", type: "stock" },
  { id: "5", text: "Supplier Updated: IT World Suppliers", time: "3 hours ago", type: "update" },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => { setError("Failed to load dashboard"); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(stats?.today_sales ?? 0),
      icon: DollarSign,
      change: "+12%",
      color: "bg-blue-500",
    },
    {
      title: "Monthly Sales",
      value: formatCurrency(stats?.monthly_sales ?? 0),
      icon: TrendingUp,
      change: "+8%",
      color: "bg-green-500",
    },
    {
      title: "Total Products",
      value: String(stats?.total_products ?? 0),
      icon: Package,
      change: `${stats?.total_products ?? 0} active`,
      color: "bg-purple-500",
    },
    {
      title: "Low Stock Items",
      value: String(stats?.low_stock_products ?? 0),
      icon: AlertTriangle,
      change: "Needs attention",
      color: "bg-red-500",
    },
    {
      title: "Total Customers",
      value: String(stats?.total_customers ?? 0),
      icon: Users,
      change: `+${stats?.total_customers ?? 0} this month`,
      color: "bg-yellow-500",
    },
    {
      title: "Total Orders",
      value: String(stats?.total_orders ?? 0),
      icon: ShoppingCart,
      change: "+5 today",
      color: "bg-indigo-500",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="mt-1 text-xs text-green-600">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="sales"
                  label={({ name }) => name}
                >
                  {topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === "sale" ? "bg-green-500" :
                    activity.type === "alert" ? "bg-red-500" :
                    activity.type === "customer" ? "bg-blue-500" :
                    "bg-gray-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.low_stock_items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{item.stock_quantity}</p>
                  <p className="text-xs text-red-500">Min: {item.min_stock_level}</p>
                </div>
              </div>
            ))}
            {(!stats?.low_stock_items || stats.low_stock_items.length === 0) && (
              <p className="text-sm text-gray-500">No low stock items.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
