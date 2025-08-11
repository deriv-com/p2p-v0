import { create } from "zustand"

export interface MarketFilterOptions {
  fromFollowing: boolean
}

interface MarketFilterState {
  // Filter states
  activeTab: "buy" | "sell"
  currency: string
  sortBy: string
  filterOptions: MarketFilterOptions
  selectedPaymentMethods: string[]
  selectedAccountCurrency: string

  // Actions
  setActiveTab: (tab: "buy" | "sell") => void
  setCurrency: (currency: string) => void
  setSortBy: (sortBy: string) => void
  setFilterOptions: (options: MarketFilterOptions) => void
  setSelectedPaymentMethods: (methods: string[]) => void
  setSelectedAccountCurrency: (currency: string) => void
  resetFilters: () => void
}

const initialState = {
  activeTab: "sell" as const,
  currency: "IDR",
  sortBy: "exchange_rate",
  filterOptions: { fromFollowing: false },
  selectedPaymentMethods: [] as string[],
  selectedAccountCurrency: "USD",
}

export const useMarketFilterStore = create<MarketFilterState>((set) => ({
  ...initialState,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setCurrency: (currency) => set({ currency }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterOptions: (options) => set({ filterOptions: options }),
  setSelectedPaymentMethods: (methods) => set({ selectedPaymentMethods: methods }),
  setSelectedAccountCurrency: (currency) => set({ selectedAccountCurrency: currency }),
  resetFilters: () => set(initialState),
}))
