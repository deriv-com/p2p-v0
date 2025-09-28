/// <reference types="jest" />

import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"
import { getKycStatus } from "@/services/api/api-auth"

// Mock the API
jest.mock("@/services/api/api-auth", () => ({
  getKycStatus: jest.fn(),
}))

const mockGetKycStatus = getKycStatus as jest.MockedFunction<typeof getKycStatus>

describe("useKycOnboardingStore", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useKycOnboardingStore.setState({
      isSheetOpen: false,
      kycStatus: null,
      isLoading: false,
      error: null,
      isPoiVerified: false,
      isPoaVerified: false,
    })
  })

  describe("Initial state", () => {
    it("should have correct initial state", () => {
      const state = useKycOnboardingStore.getState()

      expect(state.isSheetOpen).toBe(false)
      expect(state.kycStatus).toBe(null)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.isPoiVerified).toBe(false)
      expect(state.isPoaVerified).toBe(false)
    })
  })

  describe("setSheetOpen", () => {
    it("should update isSheetOpen state", () => {
      const { setSheetOpen } = useKycOnboardingStore.getState()

      setSheetOpen(true)
      expect(useKycOnboardingStore.getState().isSheetOpen).toBe(true)

      setSheetOpen(false)
      expect(useKycOnboardingStore.getState().isSheetOpen).toBe(false)
    })
  })

  describe("setKycStatus", () => {
    it("should update KYC status and verification flags when both POI and POA are verified", () => {
      const mockStatus = [
        { kyc_step: "poi" as const, status: "verified" },
        { kyc_step: "poa" as const, status: "verified" },
      ]

      const { setKycStatus } = useKycOnboardingStore.getState()
      setKycStatus(mockStatus)

      const state = useKycOnboardingStore.getState()
      expect(state.kycStatus).toEqual(mockStatus)
      expect(state.isPoiVerified).toBe(true)
      expect(state.isPoaVerified).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it("should set correct verification flags when POI is not verified", () => {
      const mockStatus = [
        { kyc_step: "poi" as const, status: "pending" },
        { kyc_step: "poa" as const, status: "verified" },
      ]

      const { setKycStatus } = useKycOnboardingStore.getState()
      setKycStatus(mockStatus)

      const state = useKycOnboardingStore.getState()
      expect(state.isPoiVerified).toBe(false)
      expect(state.isPoaVerified).toBe(true)
    })

    it("should set correct verification flags when POA is not verified", () => {
      const mockStatus = [
        { kyc_step: "poi" as const, status: "verified" },
        { kyc_step: "poa" as const, status: "pending" },
      ]

      const { setKycStatus } = useKycOnboardingStore.getState()
      setKycStatus(mockStatus)

      const state = useKycOnboardingStore.getState()
      expect(state.isPoiVerified).toBe(true)
      expect(state.isPoaVerified).toBe(false)
    })

    it("should handle missing POI or POA status", () => {
      const mockStatus = [{ kyc_step: "poi" as const, status: "verified" }]

      const { setKycStatus } = useKycOnboardingStore.getState()
      setKycStatus(mockStatus)

      const state = useKycOnboardingStore.getState()
      expect(state.isPoiVerified).toBe(true)
      expect(state.isPoaVerified).toBe(false)
    })
  })

  describe("fetchKycStatus", () => {
    it("should fetch KYC status successfully", async () => {
      const mockStatus = [
        { kyc_step: "poi" as const, status: "verified" },
        { kyc_step: "poa" as const, status: "verified" },
      ]

      mockGetKycStatus.mockResolvedValue(mockStatus)

      const { fetchKycStatus } = useKycOnboardingStore.getState()
      await fetchKycStatus()

      const state = useKycOnboardingStore.getState()
      expect(state.kycStatus).toEqual(mockStatus)
      expect(state.isPoiVerified).toBe(true)
      expect(state.isPoaVerified).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it("should handle fetch error", async () => {
      const errorMessage = "API Error"
      mockGetKycStatus.mockRejectedValue(new Error(errorMessage))

      const { fetchKycStatus } = useKycOnboardingStore.getState()
      await fetchKycStatus()

      const state = useKycOnboardingStore.getState()
      expect(state.error).toBe(errorMessage)
      expect(state.isLoading).toBe(false)
    })

    it("should set loading state during fetch", async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockGetKycStatus.mockReturnValue(promise)

      const { fetchKycStatus } = useKycOnboardingStore.getState()
      const fetchPromise = fetchKycStatus()

      // Check loading state is true during fetch
      expect(useKycOnboardingStore.getState().isLoading).toBe(true)

      // Resolve the promise
      resolvePromise!([])
      await fetchPromise

      // Check loading state is false after fetch
      expect(useKycOnboardingStore.getState().isLoading).toBe(false)
    })
  })

  describe("resetError", () => {
    it("should reset error state", () => {
      // Set an error first
      useKycOnboardingStore.setState({ error: "Some error" })
      expect(useKycOnboardingStore.getState().error).toBe("Some error")

      // Reset error
      const { resetError } = useKycOnboardingStore.getState()
      resetError()

      expect(useKycOnboardingStore.getState().error).toBe(null)
    })
  })
})
