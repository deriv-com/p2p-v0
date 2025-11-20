import type { ReactNode } from "react"

export interface Currency {
  code: string
  name: string
}

export interface CurrencyFilterProps {
  currencies: Currency[]
  selectedCurrency: string
  onCurrencySelect: (currencyCode: string) => void
  trigger: ReactNode
  title?: string
  placeholder?: string
  emptyMessage?: string
}
