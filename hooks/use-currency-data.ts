"use client"

import { useState, useCallback, useMemo } from "react"
import type { Currency } from "@/components/currency-filter/types"

// Extended currency data based on common P2P trading currencies
const CURRENCY_DATA: Currency[] = [
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
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "KRW", name: "South Korean Won" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "MYR", name: "Malaysian Ringgit" },
]

export function useCurrencyData() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("IDR")

  const currencies = useMemo(() => {
    // Sort currencies alphabetically by code for consistent display
    return CURRENCY_DATA.sort((a, b) => a.code.localeCompare(b.code))
  }, [])

  const handleCurrencySelect = useCallback((currencyCode: string) => {
    setSelectedCurrency(currencyCode)
  }, [])

  const getCurrencyByCode = useCallback(
    (code: string): Currency | undefined => {
      return currencies.find((currency) => currency.code === code)
    },
    [currencies],
  )

  const getCurrencyName = useCallback(
    (code: string): string => {
      const currency = getCurrencyByCode(code)
      return currency ? `${currency.code} - ${currency.name}` : code
    },
    [getCurrencyByCode],
  )

  const getSelectedCurrencyData = useCallback((): Currency | undefined => {
    return getCurrencyByCode(selectedCurrency)
  }, [getCurrencyByCode, selectedCurrency])

  return {
    currencies,
    selectedCurrency,
    onCurrencySelect: handleCurrencySelect,
    getCurrencyByCode,
    getCurrencyName,
    getSelectedCurrencyData,
  }
}
