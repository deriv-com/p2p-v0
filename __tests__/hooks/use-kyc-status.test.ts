import { renderHook, waitFor } from "@testing-library/react"
import { useKycStatus } from "@/hooks/use-kyc-status"
import { getKycStatus } from "@/services/api/api-auth"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

// Mock the API function
jest.mock("@/services/api/api-auth", () => ({
  getKycStatus: jest.fn(),
}))

// Mock the store
jest.mock("@/stores/kyc-onboarding-store", () => ({
  useKycOnboardingStore: jest.fn(),
}))

const mockGetKycStatus = getKycStatus as jest.MockedFunction<typeof getKycStatus>
const mockUseKycOnboardingStore = useKycOnboardingStore as jest.MockedFunction<typeof useKycOnboardingStore>

describe("useKycStatus", () => {
  const mockSetKycStatus = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseKycOnboardingStore.mockReturnValue({
      setKycStatus: mockSetKycStatus,
      isSheetOpen: false,
      profileCompleted: false,
      biometricsCompleted: false,
      showOnboarding: false,
      setSheetOpen: jest.fn(),
      resetState: jest.fn(),
    })
  })

  it("should fetch KYC status successfully", async () => {
    const mockStatus = {
      profile_completed: true,
      biometrics_completed: false,
      show_onboarding: true,
    }
    mockGetKycStatus.mockResolvedValue(mockStatus)

    const { result } = renderHook(() => useKycStatus())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockSetKycStatus).toHaveBeenCalledWith(mockStatus)
    expect(result.current.error).toBe(null)
  })

  it("should handle API errors", async () => {
    mockGetKycStatus.mockRejectedValue(new Error("API Error"))

    const { result } = renderHook(() => useKycStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe("Failed to load KYC status")
    expect(mockSetKycStatus).not.toHaveBeenCalled()
  })
})
