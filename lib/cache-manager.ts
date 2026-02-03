/**
 * Simple in-memory cache manager with TTL (Time To Live) support
 * Prevents duplicate API calls when switching between pages
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()

  /**
   * Generate a cache key from parameters
   */
  private generateKey(namespace: string, params: Record<string, any>): string {
    const paramStr = JSON.stringify(params)
    return `${namespace}:${paramStr}`
  }

  /**
   * Check if a cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now()
    return now - entry.timestamp < entry.ttl
  }

  /**
   * Get cached data
   */
  get<T>(namespace: string, params?: Record<string, any>, ttl: number = 5 * 60 * 1000): T | null {
    const key = params ? this.generateKey(namespace, params) : namespace
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached data
   */
  set<T>(namespace: string, data: T, params?: Record<string, any>, ttl: number = 5 * 60 * 1000): void {
    const key = params ? this.generateKey(namespace, params) : namespace
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Clear specific cache by namespace
   */
  clear(namespace: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${namespace}:`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear()
  }

  /**
   * Get cache size (for debugging)
   */
  getSize(): number {
    return this.cache.size
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

/**
 * Hook-friendly cache wrapper for API calls
 * Usage: const data = await cachedFetch(key, () => apiCall(params), 5 * 60 * 1000)
 */
export async function cachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000, // Default 5 minutes
): Promise<T> {
  // Check if data is in cache
  const cached = cacheManager.get<T>(cacheKey, undefined, ttl)
  if (cached !== null) {
    console.log(`[Cache] Cache hit for key: ${cacheKey}`)
    return cached
  }

  console.log(`[Cache] Cache miss for key: ${cacheKey}`)
  // Fetch fresh data
  const data = await fetchFn()

  // Store in cache
  cacheManager.set(cacheKey, data, undefined, ttl)

  return data
}

/**
 * Cache invalidation wrapper
 */
export function invalidateCache(namespace: string): void {
  cacheManager.clear(namespace)
  console.log(`[Cache] Invalidated cache for namespace: ${namespace}`)
}
