import { create } from "zustand"

export interface KycOnboardingState {
  isSheetOpen: boolean
  profileCompleted: boolean
  biometricsCompleted: boolean
  showOnboarding: boolean
  setSheetOpen: (open: boolean) => void
  setKycStatus: (status: {
    profile_completed: boolean
    biometrics_completed: boolean
    show_onboarding: boolean
  }) => void
  resetState: () => void
}

const initialState = {
  isSheetOpen: false,
  profileCompleted: false,
  showOnboarding: false,
}

export const useKycOnboardingStore = create<KycOnboardingState>((set) => ({
  ...initialState,

  setSheetOpen: (open) => set({ isSheetOpen: open }),
  setKycStatus: (status) =>
    set({
      profileCompleted: status.profile_completed,
      showOnboarding: status.show_onboarding,
      isSheetOpen: status.show_onboarding && (!status.profile_completed || !status.biometrics_completed),
    }),
  resetState: () => set(initialState),
}))
