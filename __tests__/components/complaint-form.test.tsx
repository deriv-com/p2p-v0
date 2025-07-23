import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ComplaintForm } from "@/components/complaint/complaint-form"
import { COMPLAINT_OPTIONS } from "@/components/complaint/types"
import jest from "jest" // Declare the jest variable

// Mock the mobile hook
jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: jest.fn(() => false),
}))

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  orderId: "test-order-123",
}

describe("ComplaintForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders complaint form when open", () => {
    render(<ComplaintForm {...mockProps} />)

    expect(screen.getByText("Submit a complaint")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    render(<ComplaintForm {...mockProps} isOpen={false} />)

    expect(screen.queryByText("Submit a complaint")).not.toBeInTheDocument()
  })

  it("renders all complaint options", () => {
    render(<ComplaintForm {...mockProps} />)

    COMPLAINT_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it("allows selecting a complaint option", () => {
    render(<ComplaintForm {...mockProps} />)

    const firstOption = screen.getByLabelText(COMPLAINT_OPTIONS[0].label)
    fireEvent.click(firstOption)

    expect(firstOption).toBeChecked()
  })

  it("calls onSubmit with selected option when form is submitted", async () => {
    render(<ComplaintForm {...mockProps} />)

    const firstOption = screen.getByLabelText(COMPLAINT_OPTIONS[0].label)
    const submitButton = screen.getByRole("button", { name: /submit/i })

    fireEvent.click(firstOption)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith(COMPLAINT_OPTIONS[0].value)
    })
  })

  it("does not submit when no option is selected", () => {
    render(<ComplaintForm {...mockProps} />)

    const submitButton = screen.getByRole("button", { name: /submit/i })
    fireEvent.click(submitButton)

    expect(mockProps.onSubmit).not.toHaveBeenCalled()
  })

  it("calls onClose when close button is clicked", () => {
    render(<ComplaintForm {...mockProps} />)

    const closeButton = screen.getByRole("button", { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it("renders live chat link", () => {
    render(<ComplaintForm {...mockProps} />)

    const liveChatLink = screen.getByText("live chat")
    expect(liveChatLink).toBeInTheDocument()
    expect(liveChatLink).toHaveClass("underline")
  })

  it("disables submit button when no option selected", () => {
    render(<ComplaintForm {...mockProps} />)

    const submitButton = screen.getByRole("button", { name: /submit/i })
    expect(submitButton).toBeDisabled()
  })

  it("enables submit button when option is selected", () => {
    render(<ComplaintForm {...mockProps} />)

    const firstOption = screen.getByLabelText(COMPLAINT_OPTIONS[0].label)
    const submitButton = screen.getByRole("button", { name: /submit/i })

    fireEvent.click(firstOption)

    expect(submitButton).not.toBeDisabled()
  })
})

describe("ComplaintForm Mobile", () => {
  beforeEach(() => {
    const { useIsMobile } = require("@/hooks/use-mobile")
    useIsMobile.mockReturnValue(true)
  })

  it("renders as bottom sheet on mobile", () => {
    render(<ComplaintForm {...mockProps} />)

    // Should render within a Sheet component for mobile
    expect(screen.getByText("Submit a complaint")).toBeInTheDocument()
  })
})
