"use client"

import { useState, useEffect } from "react"
import { getCurrencies } from "@/services/api/api-auth"

export interface AccountCurrency {
  code: string
  name: string
  decimal?: {
    maximum: number
    minimum: number
  }
}

export interface CurrenciesData {
  [currencyCode: string]: {
    type?: "cryptocurrency" | "fiat" | "stablecoin"
    label?: string
    decimal?: {
      maximum: number
      minimum: number
    }
    [key: string]: any
  }
}

export function useAccountCurrencies() {
  const [accountCurrencies, setAccountCurrencies] = useState<AccountCurrency[]>([])
  const [currenciesData, setCurrenciesData] = useState<CurrenciesData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccountCurrencies = async () => {
      try {
        setIsLoading(true)
        const response = await getCurrencies()

        setCurrenciesData(response)

        const currencyList = Object.keys(response)
          .map((code) => ({
            code,
            name: code,
            decimal: response[code]?.decimal,
          }))
          .sort((a, b) => {
            if (a.code === "USD") return -1
            if (b.code === "USD") return 1
            return a.code.localeCompare(b.code)
          })

        setAccountCurrencies(currencyList)
        setError(null)
      } catch (err) {
        console.error("Error fetching account currencies:", err)
        setError("Failed to load account currencies")
        setAccountCurrencies([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountCurrencies()
  }, [])

  return {
    accountCurrencies,
    currenciesData,
    isLoading,
    error,
  }
}
