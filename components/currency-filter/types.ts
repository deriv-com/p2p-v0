import type React from "react"
export interface Currency {
  code: string
  name: string
}

export interface CurrencyFilterProps {
  currencies: Currency[]
  selectedCurrency?: string
  onCurrencySelect: (currencyCode: string) => void
  trigger: React.ReactNode
  placeholder?: string
  emptyMessage?: string
}
