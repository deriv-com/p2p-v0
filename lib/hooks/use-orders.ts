"use client"

import useSWR from "swr"
import type { Order } from "@/services/api/api-orders"
import { OrdersAPI } from "@/services/api"

interface UseOrdersOptions {
  status?: "open" | "closed"
  userId?: string
  startDate?: string
  endDate?: string
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { status, userId, startDate, endDate } = options

  // Only fetch if userId is available
  const key = userId
    ? [
        "orders",
        userId,
        status || "all",
        startDate || "",
        endDate || "",
      ]
    : null

  const fetcher = async () => {
    const params: any = {}
    if (status) params.status = status
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    return await OrdersAPI.getOrders(params)
  }

  const { data, error, isLoading, mutate } = useSWR<Order[]>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds deduping interval for orders
    focusThrottleInterval: 300000, // 5 minutes focus throttle
  })

  return {
    orders: data || [],
    isLoading,
    error: error?.message || null,
    mutate,
  }
}
