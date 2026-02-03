# Page Caching System Documentation

## Overview

The page caching system implements efficient client-side caching when switching between pages. It caches API responses and scroll positions, significantly improving user experience by reducing loading times and preserving UI state.

## Architecture

### 1. **Page Cache Store** (`stores/page-cache-store.ts`)
A Zustand-based store that manages all cached page data with automatic expiration.

**Key Features:**
- Configurable cache duration
- Automatic cache validation
- Scroll position persistence
- Namespace support for cache keys

### 2. **Page Cache Hook** (`hooks/use-page-cache.ts`)
React hook for managing page-level caching with automatic restore and save.

**Key Features:**
- Auto-restore cached data on mount
- Auto-save data on unmount
- Scroll position preservation
- Custom data restoration callbacks

### 3. **Cache Utilities** (`lib/cache-utils.ts`)
Helper functions for API response caching and cache key generation.

**Key Functions:**
- `cacheAPIResponse()` - Cache API responses
- `getCachedAPIResponse()` - Retrieve valid cached data
- `createCacheKey()` - Generate namespaced cache keys
- `clearCachedData()` - Clear cache

## Usage Guide

### Basic Setup in a Page Component

```typescript
import { usePageCache } from "@/hooks/use-page-cache"
import { cacheAPIResponse, getCachedAPIResponse, createCacheKey } from "@/lib/cache-utils"

export default function MyPage() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize page cache
  const { scrollContainerRef, cachePageData } = usePageCache({
    key: "my-page",
    duration: 5 * 60 * 1000, // 5 minutes
    onDataRestore: (cachedData) => {
      if (cachedData?.items) {
        setData(cachedData.items)
        setIsLoading(false)
      }
    },
    saveScrollPosition: true,
  })

  const fetchData = async () => {
    // Generate cache key based on filters
    const cacheKey = createCacheKey("my-api", filterId, sortBy)
    
    // Check cache first
    const cached = getCachedAPIResponse(cacheKey)
    if (cached) {
      setData(cached)
      setIsLoading(false)
      cachePageData({ items: cached })
      return
    }

    try {
      const result = await api.getData(filters)
      setData(result)
      
      // Cache the response
      cacheAPIResponse(cacheKey, result, 3 * 60 * 1000) // 3 minutes
      
      // Save page state (this also saves scroll position)
      cachePageData({ items: result })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div ref={scrollContainerRef} className="overflow-auto">
      {/* Your page content */}
    </div>
  )
}
```

## Cache Configuration

### Cache Duration Options
- **Buy/Sell Page**: 5 minutes - Stable content, less frequent updates
- **Orders Page**: 3 minutes - More dynamic, frequent updates
- **Ads Page**: 4 minutes - User-specific, moderate update frequency
- **API Responses**: 2-3 minutes - Shorter to ensure fresher data

### Custom Durations
```typescript
const { scrollContainerRef, cachePageData } = usePageCache({
  key: "my-page",
  duration: 10 * 60 * 1000, // Custom 10 minutes
  saveScrollPosition: false, // Disable scroll position caching if not needed
})
```

## Cache Key Generation

### Using `createCacheKey()`
```typescript
// Simple namespace
const key1 = createCacheKey("users")

// With parameters
const key2 = createCacheKey("adverts", "buy", "USD", "bank-transfer")

// With complex filters
const key3 = createCacheKey("orders", activeTab, dateFilter, from, to)
```

### Using `generateCacheKey()`
```typescript
const filters = { status: "active", type: "buy", currency: "USD" }
const key = generateCacheKey("adverts", filters)
```

## Advanced Usage

### Manual Cache Management
```typescript
import { clearCachedData, isCachedValid } from "@/lib/cache-utils"

// Check if cache is still valid
if (isCachedValid("my-page")) {
  console.log("Cache is still fresh")
}

// Clear specific cache
clearCachedData("my-page")

// Clear all caches
clearCachedData()
```

### Data Restoration Callback
```typescript
const { scrollContainerRef, cachePageData } = usePageCache({
  key: "search-results",
  onDataRestore: (cachedData) => {
    // Custom restoration logic
    if (cachedData?.searchQuery) {
      setSearchQuery(cachedData.searchQuery)
      setResults(cachedData.results)
      setFilter(cachedData.appliedFilters)
    }
  },
})
```

## Performance Considerations

### Cache Invalidation
- Caches automatically expire based on configured duration
- Manually clear cache when data is updated via mutations (create, update, delete)
- Always invalidate related caches after API operations

```typescript
const handleAdDelete = async (adId) => {
  await api.deleteAd(adId)
  
  // Invalidate cached ads
  clearCachedData(createCacheKey("my-ads", userId))
  
  // Refetch data
  fetchAds()
}
```

### Best Practices
1. **Scope caches appropriately** - Use user-specific keys for personal data
2. **Set realistic durations** - Shorter for frequently-changing data (orders), longer for stable data (currencies)
3. **Combine with filters** - Include filter parameters in cache keys to avoid serving wrong data
4. **Clear on mutations** - Always invalidate relevant caches after create/update/delete operations
5. **Monitor bundle size** - Use cache strategically to avoid memory issues with large datasets

## Implementation Status

### Pages with Caching Implemented
- ✅ Buy/Sell Page (`/app/page.tsx`)
- ✅ Orders Page (`/app/orders/page.tsx`)
- ✅ Ads Page (`/app/ads/page.tsx`)

### Caching Features
- ✅ API response caching
- ✅ Scroll position preservation
- ✅ Filter-based cache keys
- ✅ Automatic cache expiration
- ✅ Manual cache control

## API Reference

### `usePageCache(options)`

**Parameters:**
```typescript
interface UsePageCacheOptions {
  key: string                          // Unique cache key
  duration?: number                    // Cache duration in ms
  onDataRestore?: (data: any) => void  // Callback when cache is restored
  onCacheStore?: (data: any) => void   // Callback when cache is stored
  saveScrollPosition?: boolean         // Enable/disable scroll caching
}
```

**Returns:**
```typescript
{
  scrollContainerRef: React.RefObject<HTMLDivElement>
  cachePageData: (data: any) => void
  dataRef: React.MutableRefObject<any>
}
```

### `cacheAPIResponse(key: string, data: any, duration?: number): void`
Cache an API response with optional custom duration.

### `getCachedAPIResponse(key: string): any | null`
Retrieve cached data if it's still valid, otherwise returns null.

### `createCacheKey(namespace: string, ...parts: (string | number)[]): string`
Generate a namespaced cache key from multiple parts.

### `clearCachedData(key?: string): void`
Clear specific cache or all caches if no key provided.
