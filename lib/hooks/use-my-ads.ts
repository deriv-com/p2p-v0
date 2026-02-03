"use client"

import useSWR from "swr"
import { AdsAPI } from "@/services/api"

interface MyAd {
  id: string
  [key: string]: any
}

export function useMyAds(userId?: string) {
  // Only fetch if userId is available
  const key = userId ? ["my-ads", userId] : null

  const fetcher = async () => {
    return await AdsAPI.getMyAds()
  }

  const { data, error, isLoading, mutate } = useSWR<MyAd[]>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds deduping interval
    focusThrottleInterval: 300000, // 5 minutes focus throttle
  })

  return {
    ads: data || [],
    isLoading,
    error: error?.message || null,
    mutate,
  }
}
