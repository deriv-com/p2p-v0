import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface MarketFilterOptions {
  fromFollowing: boolean
}

interface MarketFilterState {
  activeTab: "buy" | "sell"
  currency: string
  sortBy: string
  filterOptions: MarketFilterOptions
  selectedPaymentMethods: string[]
  selectedAccountCurrency: string
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
  currency: "",
  sortBy: "exchange_rate",
  filterOptions: { fromFollowing: false },
  selectedPaymentMethods: [] as string[],
  selectedAccountCurrency: "USD",
}

export const useMarketFilterStore = create<MarketFilterState>()(
  persist(
    (set: (partial: Partial<MarketFilterState>) => void) => ({
      ...initialState,

      setActiveTab: (tab: "buy" | "sell") => set({ activeTab: tab }),
      setCurrency: (currency: string) => set({ currency }),
      setSortBy: (sortBy: string) => set({ sortBy }),
      setFilterOptions: (options: MarketFilterOptions) => set({ filterOptions: options }),
      setSelectedPaymentMethods: (methods: string[]) => set({ selectedPaymentMethods: methods }),
      setSelectedAccountCurrency: (currency: string) => set({ selectedAccountCurrency: currency }),
      resetFilters: () => set(initialState),
    }),
    {
      name: "market-filter-storage",
      partialize: (state: MarketFilterState) => ({
        activeTab: state.activeTab,
        currency: state.currency,
        sortBy: state.sortBy,
        filterOptions: state.filterOptions,
        selectedPaymentMethods: state.selectedPaymentMethods,
        selectedAccountCurrency: state.selectedAccountCurrency,
      }),
    }
  )
)
