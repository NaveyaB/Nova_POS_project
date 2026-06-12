import { create } from "zustand"
import type { User, SaleItem, Customer } from "@/types"
import { createSupabaseBrowserClient } from "./supabase-client"
import { v4 as uuidv4 } from "uuid";
interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    set({ user: null })
    localStorage.removeItem("pos_cart")
  },
}))

interface POSState {
  cart: SaleItem[]
  customer: Customer | null
  addToCart: (product: {
    id: string
    name: string
    selling_price: number
    gst_percentage?: number
    image_url?: string
  }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCustomer: (customer: Customer | null) => void
  restoreCart: () => void
}

const CART_STORAGE_KEY = "pos_cart"

function saveCart(cart: SaleItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {}
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  customer: null,

  addToCart: (product) =>
    set((state) =>{
      const existing = state.cart.find((item) => item.product_id === product.id)
      let newCart: SaleItem[]
      if (existing) {
        newCart = state.cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item,
        )
      } else {
        const newItem: SaleItem = {
  id: uuidv4(),
  sale_id: "",
  product_id: product.id,
  product_name: product.name,
  quantity: 1,
  price: product.selling_price,
  subtotal: product.selling_price,
  gst_amount: product.gst_percentage
    ? Math.round((product.selling_price * product.gst_percentage) / 100)
    : 0,
  image_url: product.image_url,
}
        newCart = [...state.cart, newItem]
      }
      saveCart(newCart)
      return { cart: newCart }
    }),

  removeFromCart: (productId) =>
    set((state) => {
      const newCart = state.cart.filter((item) => item.product_id !== productId)
      saveCart(newCart)
      return { cart: newCart }
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const newCart =
        quantity <= 0
          ? state.cart.filter((item) => item.product_id !== productId)
          : state.cart.map((item) =>
              item.product_id === productId
                ? { ...item, quantity, subtotal: quantity * item.price }
                : item,
            )
      saveCart(newCart)
      return { cart: newCart }
    }),

  clearCart: () => {
    try { localStorage.removeItem(CART_STORAGE_KEY) } catch {}
    return set({ cart: [], customer: null })
  },

  setCustomer: (customer) => set({ customer }),

  restoreCart: () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          set({ cart: parsed })
        }
      }
    } catch {}
  },
}))
