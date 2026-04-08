import { create } from "zustand"
import type { Advertisement } from "@/services/api/api-buy-sell"

interface OrderSidebarState {
  pendingAd: Advertisement | null
  setPendingAd: (ad: Advertisement | null) => void
}

export const useOrderSidebarStore = create<OrderSidebarState>((set) => ({
  pendingAd: null,
  setPendingAd: (ad) => set({ pendingAd: ad }),
}))
