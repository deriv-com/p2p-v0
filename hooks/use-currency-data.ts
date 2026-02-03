"use client"

import type { Currency } from "@/components/currency-filter/types"
import { useCurrencies } from "@/hooks/use-api-queries"

export function useCurrencyData(currency = "USD") {
  const { data, isLoading, error } = useCurrencies()

  // Transform the API response into currency list
  const currencies: Currency[] = data
    ? Object.keys(data)
        .map((code) => ({
          code,
          name: code,
        }))
        .sort((a, b) => a.code.localeCompare(b.code))
    : []

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find((currency) => currency.code === code)
  }

  const getCurrencyNameByCode = (code: string): string => {
    const currency = getCurrencyByCode(code)
    return currency ? `${currency.code} - ${currency.name}` : code
  }

  return {
    currencies,
    getCurrencyByCode,
    getCurrencyName: getCurrencyNameByCode,
    isLoading,
    error: error ? "Failed to load currencies" : null,
  }
}
