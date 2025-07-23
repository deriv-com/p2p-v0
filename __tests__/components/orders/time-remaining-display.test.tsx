import { render, screen } from "@testing-library/react"
import { TimeRemainingDisplay } from "@/components/orders/time-remaining-display"
import jest from "jest" // Import jest to declare the variable

// Mock the custom hook
jest.mock("@/hooks/use-time-remaining", () => ({
  useTimeRemaining: jest.fn(),
}))

// Mock the time utils
jest.mock("@/lib/time-utils", () => ({
  formatTimeRemaining: jest.fn(),
  getTimeRemainingColor: jest.fn(),
}))

const mockUseTimeRemaining = require("@/hooks/use-time-remaining").useTimeRemaining
const mockFormatTimeRemaining = require("@/lib/time-utils").formatTimeRemaining
const mockGetTimeRemainingColor = require("@/lib/time-utils").getTimeRemainingColor

describe("TimeRemainingDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render dash when expiresAt is null", () => {
    mockUseTimeRemaining.mockReturnValue(null)

    render(<TimeRemainingDisplay expiresAt={null} />)

    expect(screen.getByText("-")).toBeInTheDocument()
  })

  it("should render dash when timeRemaining is null", () => {
    mockUseTimeRemaining.mockReturnValue(null)

    render(<TimeRemainingDisplay expiresAt="2024-01-01T14:00:00Z" />)

    expect(screen.getByText("-")).toBeInTheDocument()
  })

  it("should render formatted time with correct color", () => {
    const mockTimeRemaining = {
      hours: 2,
      minutes: 30,
      seconds: 0,
      isExpired: false,
      totalSeconds: 9000,
    }

    mockUseTimeRemaining.mockReturnValue(mockTimeRemaining)
    mockFormatTimeRemaining.mockReturnValue("2h 30m left")
    mockGetTimeRemainingColor.mockReturnValue("text-green-600")

    render(<TimeRemainingDisplay expiresAt="2024-01-01T14:30:00Z" />)

    expect(screen.getByText("2h 30m left")).toBeInTheDocument()
    expect(screen.getByText("2h 30m left")).toHaveClass("text-green-600", "font-medium")
  })

  it("should apply custom className", () => {
    const mockTimeRemaining = {
      hours: 0,
      minutes: 5,
      seconds: 0,
      isExpired: false,
      totalSeconds: 300,
    }

    mockUseTimeRemaining.mockReturnValue(mockTimeRemaining)
    mockFormatTimeRemaining.mockReturnValue("5m left")
    mockGetTimeRemainingColor.mockReturnValue("text-orange-500")

    render(<TimeRemainingDisplay expiresAt="2024-01-01T12:05:00Z" className="text-lg" />)

    expect(screen.getByText("5m left")).toHaveClass("text-orange-500", "font-medium", "text-lg")
  })
})
