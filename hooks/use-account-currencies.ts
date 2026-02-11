"use client"

import { useMemo } from "react"
import { useCurrencies } from "@/hooks/use-api-queries"

export interface AccountCurrency {
  code: string
  name: string
  decimal?: {
    maximum: number
    minimum: number
  }
}

export function useAccountCurrencies() {
  const { data: currenciesData, isLoading, error } = useCurrencies()

  const accountCurrencies = useMemo(() => {
    if (!currenciesData) return []

    return Object.keys(currenciesData)
      .map((code) => ({
        code,
        name: code,
        decimal: currenciesData[code]?.decimal,
      }))
      .sort((a, b) => {
        if (a.code === "USD") return -1
        if (b.code === "USD") return 1
        return a.code.localeCompare(b.code)
      })
  }, [currenciesData])

  return {
    accountCurrencies,
    isLoading,
    error: error ? (error as Error).message : null,
  }
}
