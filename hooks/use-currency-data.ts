"use client"

import { useState, useEffect } from "react"
import type { Currency } from "@/components/currency-filter/types"
import { getSettings } from "@/services/api/api-auth"
import { getCurrencyName } from "@/lib/currency-names"

export function useCurrencyData(currency = "USD") {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true)
        const response = await getSettings()

        const availableAdverts = response.available_adverts || {}

        let currencyList: Currency[] = []

        const paymentCurrencies = availableAdverts[currency]?.map(
          (advert: { payment_currency: string; payment_currency_name?: string }) => ({
            code: advert.payment_currency,
            name: advert.payment_currency_name || getCurrencyName(advert.payment_currency),
          }),
        )

        const uniqueCurrencies = paymentCurrencies?.reduce((acc: Currency[], curr: Currency) => {
          if (!acc.find((c) => c.code === curr.code)) {
            acc.push(curr)
          }
          return acc
        }, [])

        currencyList = (uniqueCurrencies || []).sort((a, b) => a.code.localeCompare(b.code))

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
  }, [currency])

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
    error,
  }
}
