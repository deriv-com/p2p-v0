/**
 * Hook for managing cache invalidation when mutations occur
 * Use this when making POST/PUT/DELETE requests to clear relevant caches
 */

import { useCallback } from "react"
import { invalidateCache } from "@/lib/cache-manager"

export function useCacheInvalidation() {
  const invalidateAdvertisements = useCallback(() => {
    invalidateCache("advertisements")
  }, [])

  const invalidateOrders = useCallback(() => {
    invalidateCache("orders")
  }, [])

  const invalidateOrder = useCallback((orderId: string) => {
    invalidateCache(`order:${orderId}`)
  }, [])

  const invalidatePaymentMethods = useCallback(() => {
    invalidateCache("paymentMethods")
  }, [])

  const invalidateAll = useCallback(() => {
    invalidateCache("advertisements")
    invalidateCache("orders")
    invalidateCache("paymentMethods")
  }, [])

  return {
    invalidateAdvertisements,
    invalidateOrders,
    invalidateOrder,
    invalidatePaymentMethods,
    invalidateAll,
  }
}
