import type React from "react"
export interface MarketFilterOptions {
  withinBalance: boolean
  fromFollowing: boolean
}

export interface MarketFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: MarketFilterOptions) => void
  initialFilters: MarketFilterOptions
  trigger: React.ReactElement
}
