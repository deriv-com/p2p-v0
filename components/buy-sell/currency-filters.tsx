"use client"

import { Button } from "@/components/ui/button"

interface CurrencyFiltersProps {
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
}

const currencies = [
  { code: "USD", label: "USD" },
  { code: "BTC", label: "BTC" },
  { code: "LTC", label: "LTC" },
  { code: "ETH", label: "ETH" },
  { code: "USDT", label: "USDT" },
]

export default function CurrencyFilters({ selectedCurrency, onCurrencyChange }: CurrencyFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {currencies.map((currency) => (
        <Button
          key={currency.code}
          variant={selectedCurrency === currency.code ? "default" : "outline"}
          size="sm"
          onClick={() => onCurrencyChange(currency.code)}
          className={`
            flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all
            ${
              selectedCurrency === currency.code
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }
          `}
        >
          {currency.label}
        </Button>
      ))}
    </div>
  )
}
