export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const key = `pos_invoice_counter_${year}`
  let counter: number
  try {
    counter = parseInt(localStorage.getItem(key) || "1000", 10)
  } catch {
    counter = 1000
  }
  counter++
  try {
    localStorage.setItem(key, counter.toString())
  } catch {}
  return `INV${year}${String(counter).padStart(5, "0")}`
}
