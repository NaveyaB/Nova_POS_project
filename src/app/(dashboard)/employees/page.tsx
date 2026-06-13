"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { fetchWithTimeout } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserCircle, Shield, UserPlus } from "lucide-react"
import type { Employee, Role } from "@/types"

const roleColors: Record<Role, "destructive" | "success" | "warning"> = {
  admin: "destructive",
  cashier: "success",
  manager: "warning",
}

const recentActivities = [
  { id: "a1", text: "Admin User logged in", time: "5 min ago" },
  { id: "a2", text: "Cashier User processed sale #102", time: "15 min ago" },
  { id: "a3", text: "Manager User updated inventory", time: "1 hour ago" },
  { id: "a4", text: "New employee account created", time: "2 hours ago" },
  { id: "a5", text: "Cashier User clocked out", time: "3 hours ago" },
]

interface EmployeeFormData {
  name: string
  email: string
  phone: string
  role: Role
  password: string
}

const emptyForm: EmployeeFormData = {
  name: "",
  email: "",
  phone: "",
  role: "cashier",
  password: "",
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeeFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchEmployees = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const res = await fetchWithTimeout("/api/employees", { signal, timeout: 10000 })
      if (!res.ok) throw new Error("Failed to load employees")
      const data = await res.json()
      if (!signal?.aborted) setEmployees(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      if (signal?.aborted) return
      toast.error("Failed to load employees")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchEmployees(controller.signal)
    return () => controller.abort()
  }, [fetchEmployees])

  const filtered = useMemo(() =>
    employees.filter(
      (e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.phone.includes(search)
    ),
    [employees, search]
  )

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e) => e.is_active).length
  const roleCounts = employees.reduce<Record<Role, number>>(
    (acc, e) => {
      acc[e.role] = (acc[e.role] || 0) + 1
      return acc
    },
    { admin: 0, cashier: 0, manager: 0 }
  )

  function openAddDialog() {
    setEditingEmployee(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(employee: Employee) {
    setEditingEmployee(employee)
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      password: "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill all required fields")
      return
    }

    setSaving(true)
    try {
      if (editingEmployee) {
        const res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            role: form.role,
            is_active: editingEmployee.is_active,
          }),
        })
        if (!res.ok) throw new Error("Failed to update")
        toast.success("Employee updated successfully")
      } else {
        if (!form.password) {
          toast.error("Password is required")
          return
        }
        toast.error("New employees must be created in Supabase Auth dashboard")
        return
      }
      setDialogOpen(false)
      await fetchEmployees()
    } catch {
      toast.error("Failed to save employee")
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(employee: Employee) {
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...employee,
          is_active: !employee.is_active,
        }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      toast.success(`${employee.name} ${employee.is_active ? "deactivated" : "activated"}`)
      await fetchEmployees()
    } catch {
      toast.error("Failed to update employee status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Button onClick={openAddDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500 p-2">
                <UserCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500 p-2">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500 p-2">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{roleCounts.admin}</p>
                <p className="text-sm text-gray-500">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500 p-2">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{roleCounts.manager}</p>
                <p className="text-sm text-gray-500">Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Employees</CardTitle>
            <SearchInput
              placeholder="Search employees..."
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
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>
                    <Badge variant={roleColors[employee.role]}>
                      {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.is_active ? "success" : "secondary"}>
                      {employee.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={employee.is_active ? "destructive" : "success"}
                        size="sm"
                        onClick={() => toggleStatus(employee)}
                      >
                        {employee.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                placeholder="Enter name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                placeholder="Enter email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <Input
                placeholder="Enter phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "cashier", label: "Cashier" },
                  { value: "manager", label: "Manager" },
                ]}
              />
            </div>
            {!editingEmployee && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  placeholder="Enter password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingEmployee ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
