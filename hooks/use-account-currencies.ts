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

export function useAccountCurrencies() {
  const [accountCurrencies, setAccountCurrencies] = useState<AccountCurrency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccountCurrencies = async () => {
      try {
        setIsLoading(true)
        const response = await getCurrencies()

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
    isLoading,
    error,
  }
}
