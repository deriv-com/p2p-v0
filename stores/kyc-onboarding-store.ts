import { create } from "zustand"

interface KycOnboardingState {
  isSheetOpen: boolean
  profileCompleted: boolean
  biometricsCompleted: boolean
  showOnboarding: boolean
  setSheetOpen: (open: boolean) => void
  setKycStatus: (profile: boolean, biometrics: boolean) => void
  resetState: () => void
}

export const useKycOnboardingStore = create<KycOnboardingState>((set) => ({
  isSheetOpen: false,
  profileCompleted: false,
  biometricsCompleted: false,
  showOnboarding: true,
  setSheetOpen: (open) => set({ isSheetOpen: open }),
  setKycStatus: (profile, biometrics) => set({ profileCompleted: profile, biometricsCompleted: biometrics }),
  resetState: () =>
    set({
      isSheetOpen: false,
      profileCompleted: false,
      biometricsCompleted: false,
      showOnboarding: true,
    }),
}))
