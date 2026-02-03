"use client"

import useSWR from "swr"
import type { Advertisement } from "@/services/api/api-buy-sell"
import { BuySellAPI } from "@/services/api"
import type { BuySellAPI as BuySellAPIType } from "@/services/api/api-buy-sell"

interface UseAdvertisementsOptions {
  type: "buy" | "sell"
  accountCurrency: string
  currency: string
  paymentMethods?: string[]
  sortBy?: string
  favouritesOnly?: boolean
}

export function useAdvertisements(options: UseAdvertisementsOptions) {
  const { type, accountCurrency, currency, paymentMethods, sortBy, favouritesOnly } = options

  // Create a stable key for caching
  const key =
    type && accountCurrency && currency
      ? [
          "adverts",
          type,
          accountCurrency,
          currency,
          JSON.stringify(paymentMethods || []),
          sortBy || "exchange_rate",
          favouritesOnly ? "1" : "0",
        ]
      : null

  const fetcher = async () => {
    const params: BuySellAPIType.SearchParams = {
      type,
      account_currency: accountCurrency,
      currency,
      paymentMethod: paymentMethods && paymentMethods.length > 0 ? paymentMethods : [],
      sortBy: sortBy || "exchange_rate",
    }

    if (favouritesOnly) {
      params.favourites_only = 1
    }

    const data = await BuySellAPI.getAdvertisements(params)
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format from server")
    }
    return data
  }

  const { data, error, isLoading, mutate } = useSWR<Advertisement[]>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute deduping interval
    focusThrottleInterval: 300000, // 5 minutes focus throttle
  })

  return {
    advertisements: data || [],
    isLoading,
    error: error?.message || null,
    mutate,
  }
}
