import jest from "jest"
import { render, screen, fireEvent } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { P2PBalanceWarning } from "@/components/p2p-balance-warning"

jest.mock("next/navigation")

jest.mock("@/lib/i18n/use-translations", () => ({
  useTranslations: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "market.noBalanceTitle": "No balance in P2P Wallet",
        "market.noBalanceDescription":
          "Your sell ads are hidden from the marketplace when your P2P Wallet balance is zero. Transfer funds to your P2P Wallet to make them visible again.",
        "market.noBalanceTransfer": "Transfer funds",
      }
      return map[key] ?? key
    },
    locale: "en",
  }),
}))

const mockPush = jest.fn()
;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })

describe("P2PBalanceWarning", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("renders translated title, description, and button label", () => {
    render(<P2PBalanceWarning />)
    expect(screen.getByText("No balance in P2P Wallet")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Your sell ads are hidden from the marketplace when your P2P Wallet balance is zero. Transfer funds to your P2P Wallet to make them visible again.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Transfer funds/i }),
    ).toBeInTheDocument()
  })

  it("navigates to /wallet?operation=TRANSFER when Transfer button clicked", () => {
    render(<P2PBalanceWarning />)
    fireEvent.click(screen.getByRole("button", { name: /Transfer funds/i }))
    expect(mockPush).toHaveBeenCalledWith("/wallet?operation=TRANSFER")
  })

  it("applies role=alert with aria-live=polite for screen readers", () => {
    const { container } = render(<P2PBalanceWarning />)
    const alert = container.querySelector('[role="alert"]')
    expect(alert).not.toBeNull()
    expect(alert?.getAttribute("aria-live")).toBe("polite")
  })

  it("hides the decorative icon from screen readers", () => {
    const { container } = render(<P2PBalanceWarning />)
    const icon = container.querySelector('img[aria-hidden="true"]')
    expect(icon).not.toBeNull()
    expect(icon?.getAttribute("alt")).toBe("")
  })

  it("button aria-label includes the banner title for context", () => {
    render(<P2PBalanceWarning />)
    const button = screen.getByRole("button", { name: /Transfer funds/i })
    const label = button.getAttribute("aria-label") ?? ""
    expect(label).toContain("Transfer funds")
    expect(label).toContain("No balance in P2P Wallet")
  })
})
