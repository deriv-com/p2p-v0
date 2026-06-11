"use client"

import { useMemo } from "react"
import type { Currency } from "@/components/currency-filter/types"
import { useSettings } from "@/hooks/use-api-queries"
import { useTranslations } from "@/lib/i18n/use-translations"

export function useCurrencyData(currency = "USD") {
  const { t } = useTranslations()
  const { data: response, isLoading, error: queryError } = useSettings()

  const { currencies, error } = useMemo(() => {
    if (!response) {
      return { currencies: [], error: null }
    }

    try {
      const countries = response.countries || []

      const currencyList: Currency[] = countries
        .map((country: { currency: string; currency_name: string }) => ({
          code: country.currency,
          name: country.currency_name,
        }))
        .reduce((acc: Currency[], curr: Currency) => {
          // Remove duplicates
          if (!acc.find((c) => c.code === curr.code)) {
            acc.push(curr)
          }
          return acc
        }, [])
        .sort((a, b) => a.code.localeCompare(b.code))

      return { currencies: currencyList, error: null }
    } catch (err) {
      console.error("Error processing currencies:", err)
      return { currencies: [], error: t("errors.failedToProcessCurrencies") }
    }
  }, [response, t])

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find((currency) => currency.code === code)
  }

  const getCurrencyNameByCode = (code: string): string => {
    const currency = getCurrencyByCode(code)
    return currency ? `${currency.code} - ${currency.name}` : code
  }

  const finalError = error || (queryError ? t("errors.failedToLoadCurrencies") : null)

  return {
    currencies,
    getCurrencyByCode,
    getCurrencyName: getCurrencyNameByCode,
    isLoading,
    error: finalError,
  }
}
