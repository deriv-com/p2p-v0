/// <reference types="jest" />

import { renderHook, act, waitFor } from "@testing-library/react"
import { useKycVerification } from "@/hooks/use-kyc-verification"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"
import { getKycStatus } from "@/services/api/api-auth"

// Mock the API
jest.mock("@/services/api/api-auth", () => ({
  getKycStatus: jest.fn(),
}))

const mockGetKycStatus = getKycStatus as jest.MockedFunction<typeof getKycStatus>

// Mock Zustand store
jest.mock("@/stores/kyc-onboarding-store", () => ({
  useKycOnboardingStore: jest.fn(),
}))

const mockUseKycOnboardingStore = useKycOnboardingStore as jest.MockedFunction<typeof useKycOnboardingStore>

describe("useKycVerification", () => {
  const mockStore = {
    isSheetOpen: false,
    isPoiVerified: false,
    isPoaVerified: false,
    isLoading: false,
    error: null,
    setSheetOpen: jest.fn(),
    fetchKycStatus: jest.fn(),
    resetError: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseKycOnboardingStore.mockReturnValue(mockStore)
    mockGetKycStatus.mockResolvedValue([
      { kyc_step: "poi", status: "verified" },
      { kyc_step: "poa", status: "verified" },
    ])
  })

  describe("Basic functionality", () => {
    it("should return correct verification status when both POI and POA are verified", () => {
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        isPoiVerified: true,
        isPoaVerified: true,
      })

      const { result } = renderHook(() => useKycVerification())

      expect(result.current.isPoiVerified).toBe(true)
      expect(result.current.isPoaVerified).toBe(true)
      expect(result.current.isKycVerified).toBe(true)
    })

    it("should return false for isKycVerified when POI is not verified", () => {
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        isPoiVerified: false,
        isPoaVerified: true,
      })

      const { result } = renderHook(() => useKycVerification())

      expect(result.current.isPoiVerified).toBe(false)
      expect(result.current.isPoaVerified).toBe(true)
      expect(result.current.isKycVerified).toBe(false)
    })

    it("should return false for isKycVerified when POA is not verified", () => {
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        isPoiVerified: true,
        isPoaVerified: false,
      })

      const { result } = renderHook(() => useKycVerification())

      expect(result.current.isPoiVerified).toBe(true)
      expect(result.current.isPoaVerified).toBe(false)
      expect(result.current.isKycVerified).toBe(false)
    })
  })

  describe("fetchOnMount option", () => {
    it("should fetch KYC status on mount when fetchOnMount is true", () => {
      const mockFetchKycStatus = jest.fn()
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        fetchKycStatus: mockFetchKycStatus,
      })

      renderHook(() => useKycVerification({ fetchOnMount: true }))

      expect(mockFetchKycStatus).toHaveBeenCalledTimes(1)
    })

    it("should not fetch KYC status on mount when fetchOnMount is false", () => {
      const mockFetchKycStatus = jest.fn()
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        fetchKycStatus: mockFetchKycStatus,
      })

      renderHook(() => useKycVerification({ fetchOnMount: false }))

      expect(mockFetchKycStatus).not.toHaveBeenCalled()
    })
  })

  describe("autoShowSheet option", () => {
    it("should auto-show sheet when verification is incomplete and autoShowSheet is true", async () => {
      const mockSetSheetOpen = jest.fn()
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        isPoiVerified: false,
        isPoaVerified: false,
        setSheetOpen: mockSetSheetOpen,
      })

      renderHook(() => useKycVerification({ autoShowSheet: true }))

      await waitFor(() => {
        expect(mockSetSheetOpen).toHaveBeenCalledWith(true)
      })
    })

    it("should not auto-show sheet when verification is complete", async () => {
      const mockSetSheetOpen = jest.fn()
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        isPoiVerified: true,
        isPoaVerified: true,
        setSheetOpen: mockSetSheetOpen,
      })

      renderHook(() => useKycVerification({ autoShowSheet: true }))

      await waitFor(() => {
        expect(mockSetSheetOpen).not.toHaveBeenCalled()
      })
    })
  })

  describe("Control functions", () => {
    it("should show KYC sheet when showKycSheet is called", () => {
      const mockSetSheetOpen = jest.fn()
      const mockResetError = jest.fn()
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        setSheetOpen: mockSetSheetOpen,
        resetError: mockResetError,
      })

      const { result } = renderHook(() => useKycVerification())

      act(() => {
        result.current.showKycSheet()
      })

      expect(mockResetError).toHaveBeenCalled()
      expect(mockSetSheetOpen).toHaveBeenCalledWith(true)
    })

    it("should hide KYC sheet when hideKycSheet is called", () => {
      const mockSetSheetOpen = jest.fn()
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        setSheetOpen: mockSetSheetOpen,
      })

      const { result } = renderHook(() => useKycVerification())

      act(() => {
        result.current.hideKycSheet()
      })

      expect(mockSetSheetOpen).toHaveBeenCalledWith(false)
    })
  })

  describe("checkKycAndShowSheet function", () => {
    it("should return true when KYC is verified", async () => {
      const mockFetchKycStatus = jest.fn()

      // Mock the store getter to return verified status
      ;(useKycOnboardingStore as any).getState = jest.fn().mockReturnValue({
        isPoiVerified: true,
        isPoaVerified: true,
      })

      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        fetchKycStatus: mockFetchKycStatus,
      })

      const { result } = renderHook(() => useKycVerification())

      let isVerified: boolean
      await act(async () => {
        isVerified = await result.current.checkKycAndShowSheet()
      })

      expect(mockFetchKycStatus).toHaveBeenCalled()
      expect(isVerified!).toBe(true)
    })

    it("should return false and show sheet when KYC is not verified", async () => {
      const mockFetchKycStatus = jest.fn()
      const mockSetSheetOpen = jest.fn()

      // Mock the store getter to return unverified status
      ;(useKycOnboardingStore as any).getState = jest.fn().mockReturnValue({
        isPoiVerified: false,
        isPoaVerified: false,
      })

      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        fetchKycStatus: mockFetchKycStatus,
        setSheetOpen: mockSetSheetOpen,
      })

      const { result } = renderHook(() => useKycVerification())

      let isVerified: boolean
      await act(async () => {
        isVerified = await result.current.checkKycAndShowSheet()
      })

      expect(mockFetchKycStatus).toHaveBeenCalled()
      expect(mockSetSheetOpen).toHaveBeenCalledWith(true)
      expect(isVerified!).toBe(false)
    })

    it("should return false and show sheet when fetch fails", async () => {
      const mockFetchKycStatus = jest.fn().mockRejectedValue(new Error("API Error"))
      const mockSetSheetOpen = jest.fn()

      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        fetchKycStatus: mockFetchKycStatus,
        setSheetOpen: mockSetSheetOpen,
      })

      const { result } = renderHook(() => useKycVerification())

      let isVerified: boolean
      await act(async () => {
        isVerified = await result.current.checkKycAndShowSheet()
      })

      expect(mockFetchKycStatus).toHaveBeenCalled()
      expect(mockSetSheetOpen).toHaveBeenCalledWith(true)
      expect(isVerified!).toBe(false)
    })
  })

  describe("Loading and error states", () => {
    it("should return loading state from store", () => {
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        isLoading: true,
      })

      const { result } = renderHook(() => useKycVerification())

      expect(result.current.isLoading).toBe(true)
    })

    it("should return error state from store", () => {
      const errorMessage = "Failed to fetch KYC status"
      mockUseKycOnboardingStore.mockReturnValue({
        ...mockStore,
        error: errorMessage,
      })

      const { result } = renderHook(() => useKycVerification())

      expect(result.current.error).toBe(errorMessage)
    })
  })
})
