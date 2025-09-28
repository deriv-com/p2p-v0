/// <reference types="jest" />

import { render, screen, fireEvent } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet/kyc-onboarding-sheet"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock the store
jest.mock("@/stores/kyc-onboarding-store", () => ({
  useKycOnboardingStore: jest.fn(),
}))

// Mock mobile hook
jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseKycOnboardingStore = useKycOnboardingStore as jest.MockedFunction<typeof useKycOnboardingStore>

// Mock window.open
Object.defineProperty(window, "open", {
  writable: true,
  value: jest.fn(),
})

describe("KycOnboardingSheet", () => {
  const mockSetSheetOpen = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
  })

  it("should render when sheet is open", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: false,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    expect(screen.getByText("Complete your verification")).toBeInTheDocument()
    expect(screen.getByText("Verify your identity (POI)")).toBeInTheDocument()
    expect(screen.getByText("Verify your address (POA)")).toBeInTheDocument()
  })

  it("should not render when sheet is closed", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: false,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={false} setSheetOpen={mockSetSheetOpen} />)

    expect(screen.queryByText("Complete your verification")).not.toBeInTheDocument()
  })

  it("should show loading state", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: true,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    expect(screen.getByText("Checking verification status...")).toBeInTheDocument()
  })

  it("should show error state", () => {
    const errorMessage = "Failed to fetch KYC status"
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: false,
      error: errorMessage,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it("should show completed state when both POI and POA are verified", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: true,
      isPoaVerified: true,
      isLoading: false,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    expect(screen.getByText("Verification complete! You can now create ads.")).toBeInTheDocument()
    expect(screen.getByText("Continue")).toBeInTheDocument()
  })

  it("should navigate to profile when profile setup clicked", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: false,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    const profileButton = screen.getByText("Set up and verify your profile").closest("button")
    fireEvent.click(profileButton!)

    expect(mockSetSheetOpen).toHaveBeenCalledWith(false)
    expect(mockPush).toHaveBeenCalledWith("/profile")
  })

  it("should open POI verification when POI button clicked", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: false,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    const poiButton = screen.getByText("Verify your identity (POI)").closest("button")
    fireEvent.click(poiButton!)

    expect(mockSetSheetOpen).toHaveBeenCalledWith(false)
    expect(window.open).toHaveBeenCalledWith("/profile?tab=identity", "_blank")
  })

  it("should open POA verification when POA button clicked", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: false,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    const poaButton = screen.getByText("Verify your address (POA)").closest("button")
    fireEvent.click(poaButton!)

    expect(mockSetSheetOpen).toHaveBeenCalledWith(false)
    expect(window.open).toHaveBeenCalledWith("/profile?tab=address", "_blank")
  })

  it("should close sheet when close button clicked", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isPoiVerified: false,
      isPoaVerified: false,
      isLoading: false,
      error: null,
    })

    render(<KycOnboardingSheet isSheetOpen={true} setSheetOpen={mockSetSheetOpen} />)

    const closeButton = screen.getByText("Close")
    fireEvent.click(closeButton)

    expect(mockSetSheetOpen).toHaveBeenCalledWith(false)
  })
})
