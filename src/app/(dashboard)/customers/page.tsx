"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchInput } from "@/components/ui/search-input"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users, Award, UserPlus, Pencil, ShoppingBag, Plus, Trash2 } from "lucide-react"
import type { Customer, Sale } from "@/types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" })
  const [saving, setSaving] = useState(false)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/customers")
      if (!res.ok) throw new Error("Failed to load customers")
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch("/api/sales")
      if (!res.ok) throw new Error("Failed to load sales")
      const data = await res.json()
      setSales(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
    fetchSales()
  }, [fetchCustomers, fetchSales])

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
    )
  }, [customers, search])

  const stats = useMemo(
    () => {
      const now = new Date()
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      return {
        total: customers.length,
        totalPoints: customers.reduce((sum, c) => sum + c.loyalty_points, 0),
        newThisMonth: customers.filter((c) => c.created_at.startsWith(monthPrefix)).length,
      }
    },
    [customers]
  )

  const customerSales = useMemo(() => {
    if (!historyCustomer) return []
    return sales.filter((s) => s.customer_id === historyCustomer.id)
  }, [historyCustomer, sales])

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete customer")
      toast.success("Customer deleted")
      await fetchCustomers()
    } catch {
      toast.error("Failed to delete customer")
    }
  }

  const openAddDialog = () => {
    setEditingCustomer(null)
    setFormData({ name: "", phone: "", email: "", address: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    })
    setDialogOpen(true)
  }

  const openHistory = (customer: Customer) => {
    setHistoryCustomer(customer)
    setHistoryOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingCustomer) {
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error("Failed to update")
        toast.success("Customer updated")
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error("Failed to create")
        toast.success("Customer created")
      }
      setDialogOpen(false)
      await fetchCustomers()
    } catch {
      toast.error(editingCustomer ? "Failed to update customer" : "Failed to create customer")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500 p-2">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-yellow-500 p-2">
                <Award className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
            <p className="text-sm text-gray-500">Total Loyalty Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-500 p-2">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stats.newThisMonth}</p>
            <p className="text-sm text-gray-500">New This Month</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput placeholder="Search customers..." value={search} onChange={setSearch} />
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone || "\u2014"}</TableCell>
                    <TableCell>{customer.email || "\u2014"}</TableCell>
                    <TableCell>{customer.address || "\u2014"}</TableCell>
                    <TableCell>
                      <Badge variant="warning">{customer.loyalty_points}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(customer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openHistory(customer)}>
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Customer name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingCustomer ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogHeader>
          <DialogTitle>Purchase History - {historyCustomer?.name}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {customerSales.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No purchase history found.</p>
          ) : (
            <div className="space-y-3">
              {customerSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{sale.invoice_number}</p>
                    <p className="text-xs text-gray-500">{formatDate(sale.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(sale.total)}</p>
                    <Badge
                      variant={
                        sale.status === "completed"
                          ? "success"
                          : sale.status === "refunded"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
