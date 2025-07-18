"use client"

import { useState, useEffect } from "react"
import type { Currency } from "@/components/currency-filter/types"

// Mock currency data - in a real app, this would come from an API
const MOCK_CURRENCIES: Currency[] = [
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "ARS", name: "Argentine peso" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "BOB", name: "Boliviano" },
  { code: "BRL", name: "Brazilian real" },
  { code: "COP", name: "Colombian peso" },
  { code: "CRC", name: "Costa Rican colon" },
  { code: "CUC", name: "Cuban convertible peso" },
  { code: "DOP", name: "Dominican peso" },
  { code: "EGP", name: "Egyptian pound" },
  { code: "GTQ", name: "Guatemalan quetzal" },
  { code: "HNL", name: "Honduran lempira" },
  { code: "INR", name: "Indian rupee" },
  { code: "JMD", name: "Jamaican dollar" },
  { code: "KES", name: "Kenyan shilling" },
  { code: "LKR", name: "Sri Lankan rupee" },
  { code: "MAD", name: "Moroccan dirham" },
  { code: "MXN", name: "Mexican peso" },
  { code: "NGN", name: "Nigerian naira" },
  { code: "PAB", name: "Panamanian balboa" },
  { code: "PEN", name: "Peruvian sol" },
  { code: "PHP", name: "Philippine peso" },
  { code: "PKR", name: "Pakistani rupee" },
  { code: "THB", name: "Thai baht" },
  { code: "TND", name: "Tunisian dinar" },
  { code: "UGX", name: "Ugandan shilling" },
  { code: "UYU", name: "Uruguayan peso" },
  { code: "VES", name: "Venezuelan bolívar soberano" },
  { code: "VND", name: "Vietnamese dong" },
  { code: "ZAR", name: "South African rand" },
]

export function useCurrencyData() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string>("IDR")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchCurrencies = async () => {
      setLoading(true)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCurrencies(MOCK_CURRENCIES)
      setLoading(false)
    }

    fetchCurrencies()
  }, [])

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedCurrency(currencyCode)
  }

  return {
    currencies,
    selectedCurrency,
    loading,
    onCurrencySelect: handleCurrencySelect,
  }
}
