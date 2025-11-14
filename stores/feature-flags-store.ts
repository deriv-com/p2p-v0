import { create } from "zustand"

export interface FeatureFlag {
  name: string
  enabled: boolean
  description?: string
}

interface FeatureFlagsStore {
  flags: FeatureFlag[]
  isLoading: boolean
  error: string | null
  setFlags: (flags: FeatureFlag[]) => void
  toggleFlag: (flagName: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const STORAGE_KEY = "feature_flags"

const loadFlagsFromLocalStorage = (): FeatureFlag[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Failed to load feature flags from localStorage:", error)
    return []
  }
}

const saveFlagsToLocalStorage = (flags: FeatureFlag[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  } catch (error) {
    console.error("Failed to save feature flags to localStorage:", error)
  }
}

const initialState = {
  flags: loadFlagsFromLocalStorage(),
  isLoading: false,
  error: null,
}

export const useFeatureFlagsStore = create<FeatureFlagsStore>((set) => ({
  ...initialState,
  setFlags: (flags) => {
    saveFlagsToLocalStorage(flags)
    set({ flags })
  },
  toggleFlag: (flagName) =>
    set((state) => {
      const updatedFlags = state.flags.map((flag) =>
        flag.name === flagName ? { ...flag, enabled: !flag.enabled } : flag
      )
      saveFlagsToLocalStorage(updatedFlags)
      return { flags: updatedFlags }
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
    set(initialState)
  },
}))
