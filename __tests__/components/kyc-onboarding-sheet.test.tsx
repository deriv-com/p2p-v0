import { render, screen, fireEvent } from "@testing-library/react"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet/kyc-onboarding-sheet"
import { useUserDataStore } from "@/stores/user-data-store"
import jest from "jest"

jest.mock("@/stores/user-data-store", () => ({
  useUserDataStore: jest.fn(),
}))

jest.mock("@/lib/i18n/use-translations", () => ({
  useTranslations: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "kyc.setupProfile": "Profile details",
        "kyc.phoneNumber": "Phone number",
        "kyc.proofOfIdentity": "Proof of identity",
        "kyc.proofOfAddress": "Proof of address",
        "kyc.finishAccountSetup": "Finish account setup",
        "kyc.completeRemainingSteps":
          "Complete these steps to unlock full access to Deriv P2P.",
        "kyc.continueVerification": "Continue verification",
        "kyc.heroLogoAlt": "Deriv P2P",
        "kyc.heroHeadline": "One quick check and you're ready to trade",
        "kyc.heroBenefitPlaceOrder": "Place order",
        "kyc.heroBenefitPublishAds": "Publish ads",
        "kyc.heroBenefitHigherLimits": "Higher limits",
        "kyc.heroBenefitFasterWithdrawals": "Faster withdrawals",
        "kyc.verified": "Verified",
        "kyc.statusInReview": "In review",
        "kyc.failed": "Failed",
        "kyc.unverified": "Unverified",
        "kyc.gotIt": "Got it",
        "kyc.resubmitNow": "Resubmit now",
        "kyc.checkProofOfIdentity": "Check proof of identity",
        "kyc.checkProofOfAddress": "Check proof of address",
        "kyc.resubmitIdentityAndAddress":
          "Resubmit your proof of identity and address to continue using P2P.",
        "kyc.resubmitIdentity": "Resubmit your proof of identity to continue using P2P.",
        "kyc.resubmitAddress": "Resubmit your proof of address to continue using P2P.",
      }
      return map[key] ?? key
    },
    locale: "en",
  }),
}))

const mockUseUserDataStore = useUserDataStore as jest.MockedFunction<typeof useUserDataStore>

const baseOnboardingStatus = {
  tnc: { accepted: true },
  profile: { status: "complete" },
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

describe("KycOnboardingSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete (window as any).location
    window.location = { href: "" } as any

    mockUseUserDataStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        onboardingStatus: baseOnboardingStatus,
        userId: "user-1",
        userData: { signup: "v2" },
        isWalletAccount: false,
      }
      return selector ? selector(state) : state
    })
  })

  it("renders revamped title, body, hero benefits, and default CTA", () => {
    render(<KycOnboardingSheet />)

    expect(screen.getByText("Finish account setup")).toBeInTheDocument()
    expect(
      screen.getByText("Complete these steps to unlock full access to Deriv P2P."),
    ).toBeInTheDocument()
    expect(screen.getByText("One quick check and you're ready to trade")).toBeInTheDocument()
    expect(screen.getByText("Place order")).toBeInTheDocument()
    expect(screen.getByText("Publish ads")).toBeInTheDocument()
    expect(screen.getByText("Higher limits")).toBeInTheDocument()
    expect(screen.getByText("Faster withdrawals")).toBeInTheDocument()
    expect(screen.getByText("Got it")).toBeInTheDocument()
  })

  it("uses desktop and mobile onboarding screen assets", () => {
    const { container } = render(<KycOnboardingSheet />)

    expect(
      container.querySelector('img[src="/images/onboarding/desktop_screen.svg"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('img[src="/images/onboarding/mobile_screen.svg"]'),
    ).toBeInTheDocument()
  })

  it("shows profile completion tick for completed profile step", () => {
    const { container } = render(<KycOnboardingSheet />)

    const ticks = container.querySelectorAll('img[src="/icons/tick.svg"]')
    expect(ticks.length).toBeGreaterThan(0)
  })

  it("navigates to the first incomplete step when Continue verification is clicked", () => {
    mockUseUserDataStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        onboardingStatus: {
          ...baseOnboardingStatus,
          profile: { status: "incomplete" },
          tnc: { accepted: false },
          kyc: {
            status: "pending",
            poi_status: "pending",
            poa_status: "pending",
          },
          p2p: {
            allowed: false,
            criteria: [{ code: "phone_verified", passed: false }],
          },
        },
        userId: "user-1",
        userData: { signup: "v2" },
        isWalletAccount: false,
      }
      return selector ? selector(state) : state
    })

    render(<KycOnboardingSheet />)

    fireEvent.click(screen.getByText("Continue verification"))

    expect(window.location.href).toContain("dashboard/onboarding/personal-details")
  })

  it("shows Resubmit now for expired POI/POA state", () => {
    mockUseUserDataStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        onboardingStatus: {
          ...baseOnboardingStatus,
          kyc: {
            status: "pending",
            poi_status: "pending",
            poa_status: "pending",
          },
        },
        userId: "user-1",
        userData: { signup: "v2" },
        isWalletAccount: false,
      }
      return selector ? selector(state) : state
    })

    render(<KycOnboardingSheet />)

    expect(screen.getByText("Resubmit now")).toBeInTheDocument()
  })

  it("shows check proof of identity CTA when POI is rejected and POA is complete", () => {
    mockUseUserDataStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        onboardingStatus: {
          ...baseOnboardingStatus,
          kyc: {
            status: "pending",
            poi_status: "rejected",
            poa_status: "approved",
          },
        },
        userId: "user-1",
        userData: { signup: "v2" },
        isWalletAccount: false,
      }
      return selector ? selector(state) : state
    })

    render(<KycOnboardingSheet />)

    expect(screen.getByText("Check proof of identity")).toBeInTheDocument()
  })

  it("does not render when onboarding status is null", () => {
    mockUseUserDataStore.mockImplementation((selector?: (state: any) => unknown) => {
      const state = {
        onboardingStatus: null,
        userId: "user-1",
        userData: { signup: "v2" },
        isWalletAccount: false,
      }
      return selector ? selector(state) : state
    })

    const { container } = render(<KycOnboardingSheet />)

    expect(container.firstChild).toBeNull()
  })
})
