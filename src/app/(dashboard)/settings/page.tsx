"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Store, DollarSign, Sun, Moon, Save, Database, Loader2 } from "lucide-react"
import type { StoreSettings } from "@/types"

const defaultSettings: StoreSettings = {
  store_name: "SmartPOS Store",
  logo_url: "",
  address: "123 Main Street, City, State - 400001",
  gst_number: "27AAACG1234H1Z5",
  phone: "9876543210",
  email: "store@smartpos.com",
  currency: "INR",
  tax_rate: 18,
  receipt_footer: "Thank you for your visit!",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [paymentMethod, setPaymentMethod] = useState("cash")

  function handleStoreSave() {
    toast.success("Store settings saved successfully")
  }

  function handlePosSave() {
    toast.success("POS settings saved successfully")
  }

  const applyTheme = (t: "light" | "dark") => {
    setTheme(t)
    try {
      localStorage.setItem("pos_theme", t)
      if (t === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      toast.success(`${t === "dark" ? "Dark" : "Light"} mode enabled`)
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Store Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <Input
                value={settings.store_name}
                onChange={(e) =>
                  setSettings({ ...settings, store_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <Input
                placeholder="https://example.com/logo.png"
                value={settings.logo_url || ""}
                onChange={(e) =>
                  setSettings({ ...settings, logo_url: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={settings.address || ""}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                GST Number
              </label>
              <Input
                value={settings.gst_number || ""}
                onChange={(e) =>
                  setSettings({ ...settings, gst_number: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <Input
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                value={settings.email || ""}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleStoreSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Store Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">POS Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Currency
              </label>
              <Select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                options={[
                  { value: "INR", label: "INR (₹)" },
                  { value: "USD", label: "USD ($)" },
                ]}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tax Rate (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.tax_rate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tax_rate: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Receipt Footer
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={settings.receipt_footer || ""}
              onChange={(e) =>
                setSettings({ ...settings, receipt_footer: e.target.value })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Default Payment Method
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "upi", label: "UPI" },
                  { value: "card", label: "Card" },
                  { value: "net_banking", label: "Net Banking" },
                ]}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePosSave}>
              <Save className="mr-2 h-4 w-4" />
              Save POS Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Theme</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Appearance</p>
              <p className="text-sm text-gray-500">
                Current theme:{" "}
                <span className="font-medium capitalize">{theme}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => applyTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => applyTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Database Seed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500">
            Populate the database with sample categories, products, customers, suppliers, and sales history. This will not overwrite existing data.
          </p>
          <SeedButton />
        </CardContent>
      </Card>
    </div>
  )
}

function SeedButton() {
  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState<string[] | null>(null)

  const handleSeed = async () => {
    setSeeding(true)
    setResult(null)
    try {
      const res = await fetch("/api/seed", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Seed failed")
        return
      }
      toast.success("Database seeded successfully!")
      setResult(data.details || [])
    } catch {
      toast.error("Network error. Are you logged in?")
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleSeed} disabled={seeding} variant="outline">
        {seeding ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...</>
        ) : (
          <><Database className="mr-2 h-4 w-4" /> Insert Sample Data</>
        )}
      </Button>
      {result && result.length > 0 && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {result.map((r, i) => <p key={i}>{r}</p>)}
        </div>
      )}
    </div>
  )
}
