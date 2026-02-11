"use client"

import { useState, useEffect, useRef } from "react"
import { getCurrencies } from "@/services/api/api-auth"

export interface AccountCurrency {
  code: string
  name: string
  decimal?: {
    maximum: number
    minimum: number
  }
}

// Global state to prevent duplicate API calls across component instances
let cachedCurrencies: AccountCurrency[] | null = null
let currenciesFetchPromise: Promise<AccountCurrency[]> | null = null

export function useAccountCurrencies() {
  const [accountCurrencies, setAccountCurrencies] = useState<AccountCurrency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchStartedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate calls in strict mode
    if (fetchStartedRef.current) return
    fetchStartedRef.current = true

    const fetchAccountCurrencies = async () => {
      try {
        // Return cached data if available
        if (cachedCurrencies !== null) {
          setAccountCurrencies(cachedCurrencies)
          setIsLoading(false)
          return
        }

        // Return existing promise if fetch is in progress
        if (currenciesFetchPromise) {
          const result = await currenciesFetchPromise
          setAccountCurrencies(result)
          setIsLoading(false)
          return
        }

        // Start new fetch
        currenciesFetchPromise = (async () => {
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

            cachedCurrencies = currencyList
            setAccountCurrencies(currencyList)
            setError(null)
            return currencyList
          } catch (err) {
            console.error("Error fetching account currencies:", err)
            setError("Failed to load account currencies")
            setAccountCurrencies([])
            cachedCurrencies = []
            return []
          } finally {
            setIsLoading(false)
          }
        })()

        await currenciesFetchPromise
      } catch (err) {
        console.error("Error in fetchAccountCurrencies:", err)
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
