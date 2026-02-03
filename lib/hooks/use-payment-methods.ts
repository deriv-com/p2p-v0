"use client"

import useSWR from "swr"
import type { PaymentMethod } from "@/services/api/api-buy-sell"
import { BuySellAPI } from "@/services/api"

export function usePaymentMethods() {
  const fetcher = async () => {
    return await BuySellAPI.getPaymentMethods()
  }

  const { data, error, isLoading, mutate } = useSWR<PaymentMethod[]>("payment-methods", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 600000, // 10 minutes deduping interval
  })

  return {
    paymentMethods: data || [],
    isLoading,
    error: error?.message || null,
    mutate,
  }
}
