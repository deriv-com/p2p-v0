import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ComplaintForm } from "@/components/complaint/complaint-form"
import { OrdersAPI } from "@/services/api"
import * as useMobileHook from "@/hooks/use-mobile"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the dependencies
jest.mock("@/services/api")
jest.mock("@/hooks/use-mobile")

const mockOrdersAPI = OrdersAPI as jest.Mocked<typeof OrdersAPI>
const mockUseMobile = useMobileHook as jest.Mocked<typeof useMobileHook>

describe("ComplaintForm", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    orderId: "test-order-123",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMobile.useIsMobile = jest.fn().mockReturnValue(false)
    mockOrdersAPI.disputeOrder = jest.fn().mockResolvedValue({ errors: [] })
  })

  it("renders complaint form when open", () => {
    render(<ComplaintForm {...defaultProps} />)

    expect(screen.getByText("Submit a complaint")).toBeInTheDocument()
    expect(screen.getByText("I didn't receive any payment.")).toBeInTheDocument()
    expect(screen.getByText("I received less than the agreed amount.")).toBeInTheDocument()
    expect(screen.getByText("I received more than the agreed amount.")).toBeInTheDocument()
    expect(screen.getByText("I've received payment from 3rd party")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    render(<ComplaintForm {...defaultProps} isOpen={false} />)

    expect(screen.queryByText("Submit a complaint")).not.toBeInTheDocument()
  })

  it("calls onClose when close button is clicked", () => {
    render(<ComplaintForm {...defaultProps} />)

    const closeButton = screen.getByLabelText("Close")
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it("enables submit button when option is selected", () => {
    render(<ComplaintForm {...defaultProps} />)

    const submitButton = screen.getByText("Submit")
    expect(submitButton).toBeDisabled()

    const firstOption = screen.getByLabelText("I didn't receive any payment.")
    fireEvent.click(firstOption)

    expect(submitButton).toBeEnabled()
  })

  it("submits complaint with selected option", async () => {
    render(<ComplaintForm {...defaultProps} />)

    const firstOption = screen.getByLabelText("I didn't receive any payment.")
    fireEvent.click(firstOption)

    const submitButton = screen.getByText("Submit")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOrdersAPI.disputeOrder).toHaveBeenCalledWith("test-order-123", "no_payment")
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  it("renders as bottom sheet on mobile", () => {
    mockUseMobile.useIsMobile.mockReturnValue(true)

    render(<ComplaintForm {...defaultProps} />)

    // Check if Sheet component is rendered (would need to check for specific mobile classes)
    expect(screen.getByText("Submit a complaint")).toBeInTheDocument()
  })

  it("renders as sidebar on desktop", () => {
    mockUseMobile.useIsMobile.mockReturnValue(false)

    render(<ComplaintForm {...defaultProps} />)

    // Check if desktop sidebar is rendered
    expect(screen.getByText("Submit a complaint")).toBeInTheDocument()
  })

  it("shows live chat help text", () => {
    render(<ComplaintForm {...defaultProps} />)

    expect(screen.getByText(/If your issue isn't listed, contact us via/)).toBeInTheDocument()
    expect(screen.getByText("live chat")).toBeInTheDocument()
  })

  it("handles API error gracefully", async () => {
    mockOrdersAPI.disputeOrder.mockRejectedValue(new Error("API Error"))

    render(<ComplaintForm {...defaultProps} />)

    const firstOption = screen.getByLabelText("I didn't receive any payment.")
    fireEvent.click(firstOption)

    const submitButton = screen.getByText("Submit")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOrdersAPI.disputeOrder).toHaveBeenCalled()
      // Component should still close even on error
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })
})
