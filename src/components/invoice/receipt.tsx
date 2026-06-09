"use client"

import { useRef } from "react"
import { Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { Sale } from "@/types"

interface ReceiptProps {
  sale: Sale
  onClose?: () => void
}

export function Receipt({ sale }: ReceiptProps) {
  return (
    <div id="receipt-content" className="bg-white p-6 text-sm">
      <div className="text-center border-b pb-4 mb-4">
        <h2 className="text-lg font-bold text-gray-900">SmartPOS</h2>
        <p className="text-xs text-gray-500">Inventory & Billing System</p>
        <p className="text-xs text-gray-500">GST: 33AABC1234D1Z5</p>
      </div>

      <div className="space-y-1 text-xs text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Invoice: {sale.invoice_number}</span>
          <span>{formatDateTime(sale.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier: {sale.user_name}</span>
          <span className="capitalize">{sale.payment_method.replace("_", " ")}</span>
        </div>
        {sale.customer_name && (
          <div className="flex justify-between">
            <span>Customer: {sale.customer_name}</span>
          </div>
        )}
      </div>

      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-t border-b border-gray-200">
            <th className="text-left py-1.5 font-medium text-gray-500">Item</th>
            <th className="text-center py-1.5 font-medium text-gray-500">Qty</th>
            <th className="text-right py-1.5 font-medium text-gray-500">Price</th>
            <th className="text-right py-1.5 font-medium text-gray-500">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-1.5 text-gray-900">{item.product_name}</td>
              <td className="py-1.5 text-center text-gray-900">{item.quantity}</td>
              <td className="py-1.5 text-right text-gray-900">{formatCurrency(item.price)}</td>
              <td className="py-1.5 text-right text-gray-900">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-xs border-t pt-3">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-500">
          <span>Tax</span>
          <span>{formatCurrency(sale.tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 border-t pt-1 mt-1">
          <span>Grand Total</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div className="text-center border-t mt-4 pt-4 text-xs text-gray-400">
        <p>Thank you for your purchase!</p>
        <p>Items sold are not returnable</p>
      </div>
    </div>
  )
}

export function ReceiptActions({ sale, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      window.print()
      return
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${sale.invoice_number}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; font-size: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${document.getElementById("receipt-content")?.outerHTML || ""}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  const handlePDF = async () => {
    const { default: html2canvas } = await import("html2canvas")
    const { default: jsPDF } = await import("jspdf")

    const element = document.getElementById("receipt-content")
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const imgWidth = 80
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF("p", "mm", "a4")
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    pdf.save(`invoice-${sale.invoice_number}.pdf`)
  }

  return (
    <div className="flex gap-2 pt-2" ref={receiptRef}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePDF}>
        <Download className="h-4 w-4" />
        PDF
      </Button>
      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      )}
    </div>
  )
}
