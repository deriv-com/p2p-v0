import { create } from "zustand"
import { getKycStatus, type KycStatusResponse } from "@/services/api/api-auth"

interface KycOnboardingState {
  isSheetOpen: boolean
  kycStatus: KycStatusResponse[] | null
  isLoading: boolean
  error: string | null
  isPoiVerified: boolean
  isPoaVerified: boolean
  setSheetOpen: (open: boolean) => void
  fetchKycStatus: () => Promise<void>
  setKycStatus: (status: KycStatusResponse[]) => void
  resetError: () => void
}

export const useKycOnboardingStore = create<KycOnboardingState>((set, get) => ({
  isSheetOpen: false,
  kycStatus: null,
  isLoading: false,
  error: null,
  isPoiVerified: false,
  isPoaVerified: false,

  setSheetOpen: (open: boolean) => {
    set({ isSheetOpen: open })
  },

  fetchKycStatus: async () => {
    set({ isLoading: true, error: null })
    try {
      const status = await getKycStatus()
      get().setKycStatus(status)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch KYC status",
        isLoading: false,
      })
    }
  },

  setKycStatus: (status: KycStatusResponse[]) => {
    const poiStatus = status.find((s) => s.kyc_step === "poi")
    const poaStatus = status.find((s) => s.kyc_step === "poa")

    const isPoiVerified = poiStatus?.status === "verified"
    const isPoaVerified = poaStatus?.status === "verified"

    set({
      kycStatus: status,
      isPoiVerified,
      isPoaVerified,
      isLoading: false,
      error: null,
    })
  },

  resetError: () => {
    set({ error: null })
  },
}))
