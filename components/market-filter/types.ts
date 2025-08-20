import type React from "react"
export interface MarketFilterOptions {
  withinBalance: boolean
  fromFollowing: boolean
  sortBy: "exchange_rate" | "user_rating_average_lifetime"
}

export interface MarketFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: MarketFilterOptions) => void
  initialFilters: MarketFilterOptions
  trigger: React.ReactElement
}
