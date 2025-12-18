import { render, screen, fireEvent } from "@testing-library/react"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet/kyc-onboarding-sheet"
import { useUserDataStore } from "@/stores/user-data-store"
import jest from "jest"

jest.mock("@/stores/user-data-store", () => ({
  useUserDataStore: jest.fn(),
}))

const mockUseUserDataStore = useUserDataStore as jest.MockedFunction<typeof useUserDataStore>

describe("KycOnboardingSheet", () => {
  const mockOnboardingStatus = {
    kyc: {
      status: "verified",
      poi_status: "approved",
      poa_status: "approved",
    },
    verification: {
      email_verified: true,
      phone_verified: true,
    },
    p2p: {
      allowed: true,
      criteria: [
        { code: "deposit_enabled", passed: true },
        { code: "withdraw_enabled", passed: true },
        { code: "phone_verified", passed: true },
      ],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    delete (window as any).location
    window.location = { href: "" } as any
  })

  it("should render the verification checklist", () => {
    mockUseUserDataStore.mockReturnValue(mockOnboardingStatus)

    render(<KycOnboardingSheet />)

    expect(screen.getByText("To access P2P, complete your profile and verification.")).toBeInTheDocument()
    expect(screen.getByText("Set up your profile")).toBeInTheDocument()
    expect(screen.getByText("Proof of identity")).toBeInTheDocument()
    expect(screen.getByText("Proof of address")).toBeInTheDocument()
    expect(screen.getByText("Phone number")).toBeInTheDocument()
  })

  it("should show checkmarks for completed steps", () => {
    mockUseUserDataStore.mockReturnValue(mockOnboardingStatus)

    const { container } = render(<KycOnboardingSheet />)

    const checkmarks = container.querySelectorAll('img[src="/icons/check-filled.png"]')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  it("should not show checkmarks for incomplete steps", () => {
    const incompleteStatus = {
      kyc: {
        status: "pending",
        poi_status: "pending",
        poa_status: "pending",
      },
      verification: {
        email_verified: true,
        phone_verified: false,
      },
      p2p: {
        allowed: false,
        criteria: [
          { code: "deposit_enabled", passed: false },
          { code: "withdraw_enabled", passed: false },
          { code: "phone_verified", passed: false },
        ],
      },
    }

    mockUseUserDataStore.mockReturnValue(incompleteStatus)

    const { container } = render(<KycOnboardingSheet />)

    expect(screen.getByText("Phone number")).toBeInTheDocument()

    const checkmarks = container.querySelectorAll('img[src="/icons/check-filled.png"]')
    expect(checkmarks.length).toBe(0)
  })

  it("should navigate to profile when clicked", () => {
    mockUseUserDataStore.mockReturnValue(mockOnboardingStatus)

    render(<KycOnboardingSheet />)

    const profileStep = screen.getByText("Set up your profile")
    fireEvent.click(profileStep.closest("div"))

    expect(window.location.href).toContain("dashboard/onboarding/personal-details")
  })

  it("should not render when onboarding status is null", () => {
    mockUseUserDataStore.mockReturnValue(null)

    const { container } = render(<KycOnboardingSheet />)

    expect(container.firstChild).toBeNull()
  })
})
