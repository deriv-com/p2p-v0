import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet/kyc-onboarding-sheet"
import { getOnboardingStatus } from "@/services/api/api-auth"
import jest from "jest" // Declare the jest variable

// Mock the API
jest.mock("@/services/api/api-auth", () => ({
  getOnboardingStatus: jest.fn(),
}))

const mockGetOnboardingStatus = getOnboardingStatus as jest.MockedFunction<typeof getOnboardingStatus>

describe("KycOnboardingSheet", () => {
  const mockOnboardingStatus = {
    kyc: {
      status: "verified",
    },
    verification: {
      email_verified: true,
      phone_verified: true,
    },
    p2p: {
      allowed: true,
      criteria: [
        { code: "poi", passed: true },
        { code: "poa", passed: true },
      ],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    delete (window as any).location
    window.location = { href: "" } as any
  })

  it("should render the verification checklist", async () => {
    mockGetOnboardingStatus.mockResolvedValue(mockOnboardingStatus)

    render(<KycOnboardingSheet />)

    await waitFor(() => {
      expect(screen.getByText("To access P2P, complete your profile and verification.")).toBeInTheDocument()
    })

    expect(screen.getByText("Set up your profile")).toBeInTheDocument()
    expect(screen.getByText("Proof of identity")).toBeInTheDocument()
    expect(screen.getByText("Proof of address")).toBeInTheDocument()
    expect(screen.getByText("Phone number")).toBeInTheDocument()
  })

  it("should show checkmarks for completed steps", async () => {
    mockGetOnboardingStatus.mockResolvedValue(mockOnboardingStatus)

    const { container } = render(<KycOnboardingSheet />)

    await waitFor(() => {
      const checkmarks = container.querySelectorAll("svg")
      expect(checkmarks.length).toBeGreaterThan(0)
    })
  })

  it("should not show checkmarks for incomplete steps", async () => {
    const incompleteStatus = {
      kyc: {
        status: "pending",
      },
      verification: {
        email_verified: true,
        phone_verified: false,
      },
      p2p: {
        allowed: false,
        criteria: [
          { code: "poi", passed: false },
          { code: "poa", passed: false },
        ],
      },
    }

    mockGetOnboardingStatus.mockResolvedValue(incompleteStatus)

    const { container } = render(<KycOnboardingSheet />)

    await waitFor(() => {
      expect(screen.getByText("Phone number")).toBeInTheDocument()
    })

    const checkmarks = container.querySelectorAll("svg")
    expect(checkmarks.length).toBe(0)
  })

  it("should navigate to profile when clicked", async () => {
    mockGetOnboardingStatus.mockResolvedValue(mockOnboardingStatus)

    render(<KycOnboardingSheet />)

    await waitFor(() => {
      expect(screen.getByText("Set up your profile")).toBeInTheDocument()
    })

    const profileStep = screen.getByText("Set up your profile")
    fireEvent.click(profileStep)

    expect(window.location.href).toContain("dashboard/userprofile")
  })

  it("should handle API errors gracefully", async () => {
    mockGetOnboardingStatus.mockRejectedValue(new Error("API Error"))

    const { container } = render(<KycOnboardingSheet />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })
})
