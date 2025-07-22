import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { RatingFilter } from "@/components/rating-filter"
import type { RatingOption } from "@/components/rating-filter/types"
import jest from "jest" // Declare the jest variable

// Mock the useIsMobile hook
jest.mock("@/components/ui/use-mobile", () => ({
  useIsMobile: jest.fn(() => false), // Default to desktop
}))

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src || "/placeholder.svg"} alt={alt} {...props} />,
}))

const mockRatings: RatingOption[] = [
  { value: 5, label: "5 stars", count: 120 },
  { value: 4, label: "4 stars", count: 85 },
  { value: 3, label: "3 stars", count: 45 },
  { value: 2, label: "2 stars", count: 12 },
  { value: 1, label: "1 star", count: 3 },
]

const mockTrigger = <button>Open Rating Filter</button>

describe("RatingFilter", () => {
  const mockOnRatingSelect = jest.fn()

  beforeEach(() => {
    mockOnRatingSelect.mockClear()
  })

  it("renders trigger button", () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    expect(screen.getByText("Open Rating Filter")).toBeInTheDocument()
  })

  it("opens popover when trigger is clicked", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search ratings")).toBeInTheDocument()
    })
  })

  it("displays all rating options", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      expect(screen.getByText("All ratings")).toBeInTheDocument()
      expect(screen.getByText("5 stars")).toBeInTheDocument()
      expect(screen.getByText("4 stars")).toBeInTheDocument()
      expect(screen.getByText("3 stars")).toBeInTheDocument()
      expect(screen.getByText("2 stars")).toBeInTheDocument()
      expect(screen.getByText("1 star")).toBeInTheDocument()
    })
  })

  it("calls onRatingSelect when rating is clicked", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      fireEvent.click(screen.getByText("5 stars"))
    })

    expect(mockOnRatingSelect).toHaveBeenCalledWith(5)
  })

  it('calls onRatingSelect with null when "All ratings" is clicked', async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={5}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      fireEvent.click(screen.getByText("All ratings"))
    })

    expect(mockOnRatingSelect).toHaveBeenCalledWith(null)
  })

  it("filters ratings based on search query", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search ratings")
      fireEvent.change(searchInput, { target: { value: "5" } })
    })

    await waitFor(() => {
      expect(screen.getByText("5 stars")).toBeInTheDocument()
      expect(screen.queryByText("4 stars")).not.toBeInTheDocument()
    })
  })

  it("highlights selected rating", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={4}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      const selectedRating = screen.getByText("4 stars").closest("div")
      expect(selectedRating).toHaveClass("bg-black", "text-white")
    })
  })

  it("displays rating counts when provided", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      expect(screen.getByText("(120)")).toBeInTheDocument()
      expect(screen.getByText("(85)")).toBeInTheDocument()
    })
  })

  it("shows empty message when no ratings match search", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
        emptyMessage="No matching ratings"
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search ratings")
      fireEvent.change(searchInput, { target: { value: "nonexistent" } })
    })

    await waitFor(() => {
      expect(screen.getByText("No matching ratings")).toBeInTheDocument()
    })
  })

  it("closes popover when Escape key is pressed", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search ratings")
      fireEvent.keyDown(searchInput, { key: "Escape" })
    })

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Search ratings")).not.toBeInTheDocument()
    })
  })
})

describe("RatingFilter Mobile", () => {
  const mockOnRatingSelect = jest.fn()

  beforeEach(() => {
    // Mock mobile view
    const { useIsMobile } = require("@/components/ui/use-mobile")
    useIsMobile.mockReturnValue(true)
    mockOnRatingSelect.mockClear()
  })

  afterEach(() => {
    // Reset to desktop view
    const { useIsMobile } = require("@/components/ui/use-mobile")
    useIsMobile.mockReturnValue(false)
  })

  it("renders sheet on mobile", async () => {
    render(
      <RatingFilter
        ratings={mockRatings}
        selectedRating={null}
        onRatingSelect={mockOnRatingSelect}
        trigger={mockTrigger}
      />,
    )

    fireEvent.click(screen.getByText("Open Rating Filter"))

    await waitFor(() => {
      expect(screen.getByText("Choose rating")).toBeInTheDocument()
    })
  })
})
