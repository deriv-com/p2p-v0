import { renderHook, act } from "@testing-library/react"
import { useTimeRemaining } from "@/hooks/use-time-remaining"
import jest from "jest"

// Mock the time-utils functions
jest.mock("@/lib/time-utils", () => ({
  calculateTimeRemaining: jest.fn(),
  formatTimeRemaining: jest.fn(),
}))

describe("useTimeRemaining", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    // Mock the time-utils functions
    const { calculateTimeRemaining, formatTimeRemaining } = require("@/lib/time-utils")
    calculateTimeRemaining.mockReturnValue({
      hours: 1,
      minutes: 30,
      seconds: 45,
      totalSeconds: 5445,
      isExpired: false,
    })
    formatTimeRemaining.mockReturnValue("1h 30m left")
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it("should return formatted time string", () => {
    const { result } = renderHook(() => useTimeRemaining("2023-01-01T14:30:45Z"))

    expect(result.current).toBe("1h 30m left")
  })

  it("should return dash for empty expiresAt", () => {
    const { result } = renderHook(() => useTimeRemaining(""))

    expect(result.current).toBe("-")
  })

  it("should update time every second", () => {
    const { calculateTimeRemaining, formatTimeRemaining } = require("@/lib/time-utils")

    const { result } = renderHook(() => useTimeRemaining("2023-01-01T14:30:45Z"))

    expect(result.current).toBe("1h 30m left")

    // Mock different return values for the next call
    calculateTimeRemaining.mockReturnValue({
      hours: 1,
      minutes: 30,
      seconds: 44,
      totalSeconds: 5444,
      isExpired: false,
    })
    formatTimeRemaining.mockReturnValue("1h 30m left")

    // Fast-forward time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current).toBe("1h 30m left")
    expect(calculateTimeRemaining).toHaveBeenCalledTimes(2)
    expect(formatTimeRemaining).toHaveBeenCalledTimes(2)
  })

  it("should cleanup interval on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval")

    const { unmount } = renderHook(() => useTimeRemaining("2023-01-01T14:30:45Z"))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
