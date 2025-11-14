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

const initialState = {
  flags: [],
  isLoading: false,
  error: null,
}

export const useFeatureFlagsStore = create<FeatureFlagsStore>((set) => ({
  ...initialState,
  setFlags: (flags) => set({ flags }),
  toggleFlag: (flagName) =>
    set((state) => ({
      flags: state.flags.map((flag) => (flag.name === flagName ? { ...flag, enabled: !flag.enabled } : flag)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
