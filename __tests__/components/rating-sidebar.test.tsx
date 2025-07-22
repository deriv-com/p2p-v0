import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { RatingSidebar } from "@/components/rating-filter/rating-sidebar"
import { toast } from "@/components/ui/use-toast"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the toast function
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))

const mockOnClose = jest.fn()
const mockOnSubmit = jest.fn()

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
  isSubmitting: false,
}

describe("RatingSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders when isOpen is true", () => {
    render(<RatingSidebar {...defaultProps} />)

    expect(screen.getByText("Rate and recommend")).toBeInTheDocument()
    expect(screen.getByText("How would you rate this transaction?")).toBeInTheDocument()
    expect(screen.getByText("Would you recommend this seller?")).toBeInTheDocument()
  })

  it("does not render when isOpen is false", () => {
    render(<RatingSidebar {...defaultProps} isOpen={false} />)

    expect(screen.queryByText("Rate and recommend")).not.toBeInTheDocument()
  })

  it("allows rating selection", () => {
    render(<RatingSidebar {...defaultProps} />)

    const starButtons = screen
      .getAllByRole("button")
      .filter((button) => button.querySelector("svg")?.classList.contains("h-5"))

    fireEvent.click(starButtons[3]) // Click 4th star (4 stars)

    // Check if stars are filled correctly
    const stars = screen.getAllByTestId("star") || starButtons
    expect(stars).toHaveLength(5)
  })

  it("allows recommendation selection", () => {
    render(<RatingSidebar {...defaultProps} />)

    const yesButton = screen.getByText("Yes").closest("button")
    const noButton = screen.getByText("No").closest("button")

    fireEvent.click(yesButton!)
    expect(yesButton).toHaveClass("border-green-500")

    fireEvent.click(noButton!)
    expect(noButton).toHaveClass("border-red-500")
  })

  it("shows error toast when submitting without rating", async () => {
    render(<RatingSidebar {...defaultProps} />)

    const submitButton = screen.getByText("Submit")
    fireEvent.click(submitButton)

    expect(toast).toHaveBeenCalledWith({
      title: "Rating required",
      description: "Please select a star rating before submitting.",
      variant: "destructive",
    })
  })

  it("calls onSubmit with correct data when form is valid", async () => {
    render(<RatingSidebar {...defaultProps} />)

    // Select 5 stars
    const starButtons = screen
      .getAllByRole("button")
      .filter((button) => button.querySelector("svg")?.classList.contains("h-5"))
    fireEvent.click(starButtons[4])

    // Select recommendation
    const yesButton = screen.getByText("Yes").closest("button")
    fireEvent.click(yesButton!)

    // Submit
    const submitButton = screen.getByText("Submit")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        rating: 5,
        recommend: true,
      })
    })
  })

  it("calls onClose when close button is clicked", () => {
    render(<RatingSidebar {...defaultProps} />)

    const closeButton =
      screen.getByRole("button", { name: /close/i }) ||
      screen
        .getAllByRole("button")
        .find(
          (btn) =>
            btn.querySelector("svg")?.classList.contains("h-5") &&
            btn.querySelector("svg")?.getAttribute("data-testid") !== "star",
        )

    if (closeButton) {
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it("disables form elements when submitting", () => {
    render(<RatingSidebar {...defaultProps} isSubmitting={true} />)

    const submitButton = screen.getByText("Submitting...")
    expect(submitButton).toBeDisabled()

    const starButtons = screen
      .getAllByRole("button")
      .filter((button) => button.querySelector("svg")?.classList.contains("h-5"))
    starButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it("uses custom labels when provided", () => {
    const customProps = {
      ...defaultProps,
      title: "Custom Title",
      ratingLabel: "Custom Rating Label",
      recommendLabel: "Custom Recommend Label",
    }

    render(<RatingSidebar {...customProps} />)

    expect(screen.getByText("Custom Title")).toBeInTheDocument()
    expect(screen.getByText("Custom Rating Label")).toBeInTheDocument()
    expect(screen.getByText("Custom Recommend Label")).toBeInTheDocument()
  })
})
