import { create } from "zustand"

export interface CachedPageData {
  timestamp: number
  data: any
  scrollPosition?: number
}

interface PageCacheState {
  cache: Map<string, CachedPageData>
  cacheDuration: number // in milliseconds
  setCacheDuration: (duration: number) => void
  setCacheData: (key: string, data: any, scrollPosition?: number) => void
  getCacheData: (key: string) => any | null
  isCacheValid: (key: string) => boolean
  clearCache: (key?: string) => void
  getCacheTimestamp: (key: string) => number | null
  getScrollPosition: (key: string) => number | undefined
}

export const usePageCacheStore = create<PageCacheState>((set, get) => ({
  cache: new Map(),
  cacheDuration: 5 * 60 * 1000, // 5 minutes default

  setCacheDuration: (duration: number) => set({ cacheDuration: duration }),

  setCacheData: (key: string, data: any, scrollPosition?: number) => {
    set((state) => {
      const newCache = new Map(state.cache)
      newCache.set(key, {
        timestamp: Date.now(),
        data,
        scrollPosition,
      })
      return { cache: newCache }
    })
  },

  getCacheData: (key: string) => {
    const state = get()
    const cached = state.cache.get(key)
    if (cached && state.isCacheValid(key)) {
      return cached.data
    }
    return null
  },

  isCacheValid: (key: string) => {
    const state = get()
    const cached = state.cache.get(key)
    if (!cached) return false
    const age = Date.now() - cached.timestamp
    return age < state.cacheDuration
  },

  clearCache: (key?: string) => {
    set((state) => {
      if (key) {
        const newCache = new Map(state.cache)
        newCache.delete(key)
        return { cache: newCache }
      }
      return { cache: new Map() }
    })
  },

  getCacheTimestamp: (key: string) => {
    const state = get()
    return state.cache.get(key)?.timestamp ?? null
  },

  getScrollPosition: (key: string) => {
    const state = get()
    return state.cache.get(key)?.scrollPosition
  },
}))
