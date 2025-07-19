"use client"

import { useState, useCallback } from "react"
import type { Currency } from "@/components/currency-filter/types"

const MOCK_CURRENCIES: Currency[] = [
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "ARS", name: "Argentine peso" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "BOB", name: "Boliviano" },
  { code: "BRL", name: "Brazilian real" },
  { code: "COP", name: "Colombian peso" },
  { code: "CRC", name: "Costa Rican colon" },
  { code: "GHS", name: "Ghanaian cedi" },
  { code: "KES", name: "Kenyan shilling" },
  { code: "LKR", name: "Sri Lankan rupee" },
  { code: "MAD", name: "Moroccan dirham" },
  { code: "MXN", name: "Mexican peso" },
  { code: "NGN", name: "Nigerian naira" },
  { code: "PKR", name: "Pakistani rupee" },
  { code: "PEN", name: "Peruvian sol" },
  { code: "PHP", name: "Philippine peso" },
  { code: "THB", name: "Thai baht" },
  { code: "TZS", name: "Tanzanian shilling" },
  { code: "UGX", name: "Ugandan shilling" },
  { code: "VND", name: "Vietnamese dong" },
]

export function useCurrencyData() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("IDR")
  const [currencies] = useState<Currency[]>(MOCK_CURRENCIES)

  const handleCurrencySelect = useCallback((currencyCode: string) => {
    setSelectedCurrency(currencyCode)
  }, [])

  return {
    currencies,
    selectedCurrency,
    onCurrencySelect: handleCurrencySelect,
  }
}
