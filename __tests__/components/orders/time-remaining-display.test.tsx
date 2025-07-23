import { render, screen } from "@testing-library/react"
import { TimeRemainingDisplay } from "@/components/orders/time-remaining-display"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the hooks and utilities
jest.mock("@/hooks/use-time-remaining")
jest.mock("@/lib/time-utils")

const mockUseTimeRemaining = require("@/hooks/use-time-remaining").useTimeRemaining
const mockFormatTimeRemaining = require("@/lib/time-utils").formatTimeRemaining
const mockGetTimeRemainingColor = require("@/lib/time-utils").getTimeRemainingColor

describe("TimeRemainingDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render formatted time with correct color", () => {
    const mockTimeRemaining = {
      hours: 1,
      minutes: 30,
      seconds: 0,
      totalSeconds: 5400,
      isExpired: false,
    }

    mockUseTimeRemaining.mockReturnValue(mockTimeRemaining)
    mockFormatTimeRemaining.mockReturnValue("1h 30m left")
    mockGetTimeRemainingColor.mockReturnValue("text-green-600")

    render(<TimeRemainingDisplay expiresAt="2024-01-01T13:30:00Z" />)

    expect(screen.getByText("1h 30m left")).toBeInTheDocument()
    expect(screen.getByText("1h 30m left")).toHaveClass("text-green-600")
  })

  it("should render expired state", () => {
    const mockTimeRemaining = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    }

    mockUseTimeRemaining.mockReturnValue(mockTimeRemaining)
    mockFormatTimeRemaining.mockReturnValue("Expired")
    mockGetTimeRemainingColor.mockReturnValue("text-red-600")

    render(<TimeRemainingDisplay expiresAt="2024-01-01T11:00:00Z" />)

    expect(screen.getByText("Expired")).toBeInTheDocument()
    expect(screen.getByText("Expired")).toHaveClass("text-red-600")
  })

  it("should apply custom className", () => {
    const mockTimeRemaining = {
      hours: 0,
      minutes: 5,
      seconds: 0,
      totalSeconds: 300,
      isExpired: false,
    }

    mockUseTimeRemaining.mockReturnValue(mockTimeRemaining)
    mockFormatTimeRemaining.mockReturnValue("5m left")
    mockGetTimeRemainingColor.mockReturnValue("text-orange-600")

    render(<TimeRemainingDisplay expiresAt="2024-01-01T12:05:00Z" className="text-lg" />)

    expect(screen.getByText("5m left")).toHaveClass("text-lg", "text-orange-600")
  })
})
