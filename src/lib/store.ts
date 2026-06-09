import { create } from "zustand"
import type { User, Product, SaleItem, Customer } from "@/types"
import { v4 as uuidv4 } from "uuid";

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}))

interface POSState {
  cart: SaleItem[]
  customer: Customer | null
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCustomer: (customer: Customer | null) => void
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],
  customer: null,
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find(
        (item) => item.product_id === product.id
      )
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.price,
                }
              : item
          ),
        }
      }
      const newItem: SaleItem = {
        id: uuidv4(),
        sale_id: "",
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.selling_price,
        subtotal: product.selling_price,
        gst_amount: 0,
      }
      return { cart: [...state.cart, newItem] }
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product_id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: quantity <= 0
        ? state.cart.filter((item) => item.product_id !== productId)
        : state.cart.map((item) =>
            item.product_id === productId
              ? { ...item, quantity, subtotal: quantity * item.price }
              : item
          ),
    })),
  clearCart: () => set({ cart: [], customer: null }),
  setCustomer: (customer) => set({ customer }),
}))
