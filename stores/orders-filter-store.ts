import { create } from "zustand"

interface OrdersFilterState {
  activeTab: "active" | "past"
  setActiveTab: (tab: "active" | "past") => void
  resetFilters: () => void
}

const initialState = {
  activeTab: "active" as const,
}

export const useOrdersFilterStore = create<OrdersFilterState>((set) => ({
  ...initialState,

  setActiveTab: (tab) => set({ activeTab: tab }),

  resetFilters: () => set(initialState),
}))
