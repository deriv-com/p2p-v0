import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import AdPaymentMethods from "@/app/ads/components/ad-payment-methods"
import { ProfileAPI } from "@/services/api"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the dependencies
jest.mock("@/services/api", () => ({
  ProfileAPI: {
    getUserPaymentMethods: jest.fn(),
    addPaymentMethod: jest.fn(),
  },
}))

jest.mock("@/hooks/use-alert-dialog", () => ({
  useAlertDialog: jest.fn(),
}))

jest.mock("@/lib/utils", () => ({
  getCategoryDisplayName: jest.fn((type) => type),
  getMethodDisplayDetails: jest.fn((method) => ({
    primary: method.display_name,
    secondary: "Test details",
  })),
  getPaymentMethodColour: jest.fn(() => "bg-blue-500"),
}))

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src || "/placeholder.svg"} alt={alt} {...props} />,
}))

const mockPaymentMethods = [
  {
    id: 1,
    method: "bank_transfer",
    type: "bank",
    display_name: "Bank Transfer 1",
    fields: { account_number: "123456" },
  },
  {
    id: 2,
    method: "bank_transfer",
    type: "bank",
    display_name: "Bank Transfer 2",
    fields: { account_number: "789012" },
  },
  {
    id: 3,
    method: "ewallet",
    type: "ewallet",
    display_name: "E-Wallet 1",
    fields: { account_id: "ewallet123" },
  },
  {
    id: 4,
    method: "ewallet",
    type: "ewallet",
    display_name: "E-Wallet 2",
    fields: { account_id: "ewallet456" },
  },
  {
    id: 5,
    method: "crypto",
    type: "crypto",
    display_name: "Crypto Wallet",
    fields: { wallet_address: "crypto789" },
  },
]

const mockShowAlert = jest.fn()

describe("AdPaymentMethods", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(ProfileAPI.getUserPaymentMethods as jest.Mock).mockResolvedValue(mockPaymentMethods)
    ;(useAlertDialog as jest.Mock).mockReturnValue({ showAlert: mockShowAlert })
    // Clear window global
    delete (window as any).adPaymentMethodIds
  })

  it("renders loading state initially", () => {
    render(<AdPaymentMethods />)
    expect(screen.getByText("Select payment method")).toBeInTheDocument()
  })

  it("renders payment methods after loading", async () => {
    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("Bank Transfer 1")).toBeInTheDocument()
      expect(screen.getByText("Bank Transfer 2")).toBeInTheDocument()
      expect(screen.getByText("E-Wallet 1")).toBeInTheDocument()
      expect(screen.getByText("E-Wallet 2")).toBeInTheDocument()
      expect(screen.getByText("Crypto Wallet")).toBeInTheDocument()
    })
  })

  it("allows selecting up to 3 payment methods", async () => {
    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("Bank Transfer 1")).toBeInTheDocument()
    })

    // Select first 3 methods
    const checkboxes = screen.getAllByRole("checkbox")
    fireEvent.click(checkboxes[0]) // Bank Transfer 1
    fireEvent.click(checkboxes[1]) // Bank Transfer 2
    fireEvent.click(checkboxes[2]) // E-Wallet 1

    expect((window as any).adPaymentMethodIds).toEqual([1, 2, 3])
  })

  it("disables remaining checkboxes when 3 methods are selected", async () => {
    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("Bank Transfer 1")).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole("checkbox")

    // Select first 3 methods
    fireEvent.click(checkboxes[0]) // Bank Transfer 1
    fireEvent.click(checkboxes[1]) // Bank Transfer 2
    fireEvent.click(checkboxes[2]) // E-Wallet 1

    // Check that remaining checkboxes are disabled
    expect(checkboxes[3]).toBeDisabled()
    expect(checkboxes[4]).toBeDisabled()
  })

  it("prevents selecting more than 3 methods", async () => {
    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("Bank Transfer 1")).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole("checkbox")

    // Select first 3 methods
    fireEvent.click(checkboxes[0]) // Bank Transfer 1
    fireEvent.click(checkboxes[1]) // Bank Transfer 2
    fireEvent.click(checkboxes[2]) // E-Wallet 1

    // Try to select 4th method - should not work
    fireEvent.click(checkboxes[3]) // E-Wallet 2

    expect((window as any).adPaymentMethodIds).toEqual([1, 2, 3])
    expect((window as any).adPaymentMethodIds).not.toContain(4)
  })

  it("re-enables checkboxes when deselecting methods", async () => {
    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("Bank Transfer 1")).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole("checkbox")

    // Select 3 methods
    fireEvent.click(checkboxes[0]) // Bank Transfer 1
    fireEvent.click(checkboxes[1]) // Bank Transfer 2
    fireEvent.click(checkboxes[2]) // E-Wallet 1

    // Verify 4th checkbox is disabled
    expect(checkboxes[3]).toBeDisabled()

    // Deselect one method
    fireEvent.click(checkboxes[0]) // Deselect Bank Transfer 1

    // Verify 4th checkbox is now enabled
    expect(checkboxes[3]).not.toBeDisabled()
  })

  it("shows visual indication for disabled payment methods", async () => {
    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("Bank Transfer 1")).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole("checkbox")

    // Select 3 methods to trigger disabled state
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    fireEvent.click(checkboxes[2])

    // Find the cards for disabled methods
    const cards = screen.getAllByRole("button")
    const disabledCards = cards.filter(
      (card) => card.classList.contains("opacity-50") || card.classList.contains("cursor-not-allowed"),
    )

    expect(disabledCards.length).toBeGreaterThan(0)
  })

  it("updates window.adPaymentMethodIds when selection changes", async () => {
    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("Bank Transfer 1")).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole("checkbox")

    // Initially empty
    expect((window as any).adPaymentMethodIds).toEqual([])

    // Select one method
    fireEvent.click(checkboxes[0])
    expect((window as any).adPaymentMethodIds).toEqual([1])

    // Select another method
    fireEvent.click(checkboxes[1])
    expect((window as any).adPaymentMethodIds).toEqual([1, 2])

    // Deselect first method
    fireEvent.click(checkboxes[0])
    expect((window as any).adPaymentMethodIds).toEqual([2])
  })

  it("handles empty payment methods list", async () => {
    ;(ProfileAPI.getUserPaymentMethods as jest.Mock).mockResolvedValue([])

    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("No payment methods are added yet")).toBeInTheDocument()
    })
  })

  it("handles API error gracefully", async () => {
    ;(ProfileAPI.getUserPaymentMethods as jest.Mock).mockRejectedValue(new Error("API Error"))

    render(<AdPaymentMethods />)

    await waitFor(() => {
      expect(screen.getByText("No payment methods are added yet")).toBeInTheDocument()
    })
  })
})
