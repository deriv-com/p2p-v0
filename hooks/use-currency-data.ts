"use client"

import { useState, useEffect } from "react"
import type { Currency } from "@/components/currency-filter/types"
import { getCountries } from "@/services/api/api-auth"

export function useCurrencyData() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true)
        const response = await getCountries()

        // Extract unique currencies from countries response
        const currencyMap = new Map<string, Currency>()

        response.countries.forEach((country) => {
          if (country.currency && country.currency_name) {
            currencyMap.set(country.currency, {
              code: country.currency,
              name: country.currency_name,
            })
          }
        })

        // Convert map to array and sort by currency code
        const currencyList = Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code))

        setCurrencies(currencyList)
        setError(null)
      } catch (err) {
        console.error("Error fetching currencies:", err)
        setError("Failed to load currencies")
        setCurrencies([
          { code: "USD", name: "US Dollar" },
          { code: "EUR", name: "Euro" },
          { code: "GBP", name: "British Pound" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrencies()
  }, [])

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find((currency) => currency.code === code)
  }

  const getCurrencyName = (code: string): string => {
    const currency = getCurrencyByCode(code)
    return currency ? `${currency.code} - ${currency.name}` : code
  }

  return {
    currencies,
    getCurrencyByCode,
    getCurrencyName,
    isLoading,
    error,
  }
}
