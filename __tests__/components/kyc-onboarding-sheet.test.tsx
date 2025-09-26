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

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseKycOnboardingStore = useKycOnboardingStore as jest.MockedFunction<typeof useKycOnboardingStore>

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
      isSheetOpen: true,
      profileCompleted: false,
      biometricsCompleted: false,
      showOnboarding: true,
      setSheetOpen: mockSetSheetOpen,
      setKycStatus: jest.fn(),
      resetState: jest.fn(),
    })

    render(<KycOnboardingSheet />)

    expect(screen.getByText("Get started with P2P")).toBeInTheDocument()
    expect(screen.getByText("Set up and verify your profile")).toBeInTheDocument()
    expect(screen.getByText("Add biometrics")).toBeInTheDocument()
  })

  it("should not render when sheet is closed", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isSheetOpen: false,
      profileCompleted: false,
      biometricsCompleted: false,
      showOnboarding: true,
      setSheetOpen: mockSetSheetOpen,
      setKycStatus: jest.fn(),
      resetState: jest.fn(),
    })

    render(<KycOnboardingSheet />)

    expect(screen.queryByText("Get started with P2P")).not.toBeInTheDocument()
  })

  it("should navigate to profile when profile setup clicked", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isSheetOpen: true,
      profileCompleted: false,
      biometricsCompleted: false,
      showOnboarding: true,
      setSheetOpen: mockSetSheetOpen,
      setKycStatus: jest.fn(),
      resetState: jest.fn(),
    })

    render(<KycOnboardingSheet />)

    const profileButton = screen.getByText("Set up and verify your profile").closest("button")
    fireEvent.click(profileButton!)

    expect(mockSetSheetOpen).toHaveBeenCalledWith(false)
    expect(mockPush).toHaveBeenCalledWith("/profile")
  })

  it("should show completed state for finished tasks", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isSheetOpen: true,
      profileCompleted: true,
      biometricsCompleted: false,
      showOnboarding: true,
      setSheetOpen: mockSetSheetOpen,
      setKycStatus: jest.fn(),
      resetState: jest.fn(),
    })

    render(<KycOnboardingSheet />)

    const profileTitle = screen.getByText("Set up and verify your profile")
    expect(profileTitle).toHaveClass("line-through")
  })

  it("should close sheet when skip button clicked", () => {
    mockUseKycOnboardingStore.mockReturnValue({
      isSheetOpen: true,
      profileCompleted: false,
      biometricsCompleted: false,
      showOnboarding: true,
      setSheetOpen: mockSetSheetOpen,
      setKycStatus: jest.fn(),
      resetState: jest.fn(),
    })

    render(<KycOnboardingSheet />)

    const skipButton = screen.getByText("Skip for now")
    fireEvent.click(skipButton)

    expect(mockSetSheetOpen).toHaveBeenCalledWith(false)
  })
})
