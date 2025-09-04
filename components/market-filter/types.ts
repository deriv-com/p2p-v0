import type React from "react"

export interface MarketFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: { fromFollowing: boolean }) => void
  initialFilters: { fromFollowing: boolean }
  trigger: React.ReactElement
}
