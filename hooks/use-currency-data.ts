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
        const currencyMap = new Map<string, Currency>()

        response.forEach((country) => {
          if (country.currency) {
            currencyMap.set(country.currency, {
              code: country.currency,
            })
          }
        })
        const currencyList = Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code))

        setCurrencies(currencyList)
        setError(null)
      } catch (err) {
        console.error("Error fetching currencies:", err)
        setError("Failed to load currencies")
        setCurrencies([])
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
