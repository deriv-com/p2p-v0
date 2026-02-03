import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePageCacheStore } from "@/stores/page-cache-store"

interface UsePageCacheOptions {
  key: string
  duration?: number // in milliseconds
  onDataRestore?: (data: any) => void
  onCacheStore?: (data: any) => void
  saveScrollPosition?: boolean
}

/**
 * Hook for managing page-level caching when navigating between pages
 * Automatically saves component data and scroll position on unmount
 * Restores cached data and scroll position on mount if cache is still valid
 */
export const usePageCache = ({
  key,
  duration,
  onDataRestore,
  onCacheStore,
  saveScrollPosition = true,
}: UsePageCacheOptions) => {
  const router = useRouter()
  const { setCacheData, getCacheData, setCacheDuration, getScrollPosition, isCacheValid } = usePageCacheStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dataRef = useRef<any>(null)

  // Set custom cache duration if provided
  useEffect(() => {
    if (duration) {
      setCacheDuration(duration)
    }
  }, [duration, setCacheDuration])

  // Restore cached data and scroll position on mount
  useEffect(() => {
    const cachedData = getCacheData(key)
    
    if (cachedData && isCacheValid(key)) {
      // Restore data
      dataRef.current = cachedData
      if (onDataRestore) {
        onDataRestore(cachedData)
      }

      // Restore scroll position
      if (saveScrollPosition && scrollContainerRef.current) {
        const savedScrollPosition = getScrollPosition(key)
        if (savedScrollPosition !== undefined) {
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = savedScrollPosition
            }
          })
        }
      }
    }
  }, [key, getCacheData, isCacheValid, saveScrollPosition, getScrollPosition, onDataRestore])

  // Save data and scroll position on unmount
  const cachePageData = useCallback((data: any) => {
    const scrollPosition = saveScrollPosition && scrollContainerRef.current 
      ? scrollContainerRef.current.scrollTop 
      : undefined

    setCacheData(key, data, scrollPosition)
    
    if (onCacheStore) {
      onCacheStore(data)
    }
  }, [key, saveScrollPosition, setCacheData, onCacheStore])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dataRef.current) {
        const scrollPosition = saveScrollPosition && scrollContainerRef.current 
          ? scrollContainerRef.current.scrollTop 
          : undefined
        setCacheData(key, dataRef.current, scrollPosition)
      }
    }
  }, [key, saveScrollPosition, setCacheData])

  return {
    scrollContainerRef,
    cachePageData,
    dataRef,
  }
}
