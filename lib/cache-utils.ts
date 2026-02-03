import { usePageCacheStore } from "@/stores/page-cache-store"

interface CacheConfig {
  key: string
  duration?: number // in milliseconds
}

/**
 * Cache an API response with automatic expiration
 */
export const cacheAPIResponse = (key: string, data: any, duration?: number) => {
  const { setCacheData, setCacheDuration } = usePageCacheStore.getState()
  
  if (duration) {
    setCacheDuration(duration)
  }
  
  setCacheData(key, data)
}

/**
 * Retrieve cached API response if valid
 */
export const getCachedAPIResponse = (key: string): any | null => {
  const { getCacheData, isCacheValid } = usePageCacheStore.getState()
  
  if (isCacheValid(key)) {
    return getCacheData(key)
  }
  
  return null
}

/**
 * Check if cached data exists and is valid
 */
export const isCachedValid = (key: string): boolean => {
  const { isCacheValid } = usePageCacheStore.getState()
  return isCacheValid(key)
}

/**
 * Clear specific or all cached data
 */
export const clearCachedData = (key?: string) => {
  const { clearCache } = usePageCacheStore.getState()
  clearCache(key)
}

/**
 * Helper hook for managing API call with caching
 * Automatically caches successful responses
 */
export const useApiCache = (apiCall: () => Promise<any>, config: CacheConfig) => {
  const { key, duration } = config

  return async () => {
    // Check cache first
    const cached = getCachedAPIResponse(key)
    if (cached !== null) {
      return cached
    }

    try {
      // Make API call
      const response = await apiCall()
      
      // Cache response
      cacheAPIResponse(key, response, duration)
      
      return response
    } catch (error) {
      throw error
    }
  }
}

/**
 * Generate cache key from filter parameters
 */
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join("&")
  
  return `${prefix}:${sortedParams}`
}

/**
 * Create namespace-based cache keys to avoid collisions
 */
export const createCacheKey = (namespace: string, ...parts: (string | number)[]): string => {
  return [namespace, ...parts].join("::")
}
