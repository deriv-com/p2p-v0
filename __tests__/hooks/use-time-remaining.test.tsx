import { renderHook, act } from "@testing-library/react"
import { useTimeRemaining } from "@/hooks/use-time-remaining"
import jest from "jest" // Declare the jest variable

// Mock the time utils
jest.mock("@/lib/time-utils", () => ({
  calculateTimeRemaining: jest.fn(),
}))

const mockCalculateTimeRemaining = require("@/lib/time-utils").calculateTimeRemaining

describe("useTimeRemaining", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("should return null when expiresAt is null", () => {
    const { result } = renderHook(() => useTimeRemaining(null))
    expect(result.current).toBeNull()
  })

  it("should calculate time remaining and update every second", () => {
    const expiresAt = "2024-01-01T14:00:00Z"
    const mockTimeRemaining = {
      hours: 2,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      totalSeconds: 7200,
    }

    mockCalculateTimeRemaining.mockReturnValue(mockTimeRemaining)

    const { result } = renderHook(() => useTimeRemaining(expiresAt))

    expect(result.current).toEqual(mockTimeRemaining)
    expect(mockCalculateTimeRemaining).toHaveBeenCalledWith(expiresAt)

    // Fast forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(mockCalculateTimeRemaining).toHaveBeenCalledTimes(2)
  })

  it("should clean up interval on unmount", () => {
    const expiresAt = "2024-01-01T14:00:00Z"
    const mockTimeRemaining = {
      hours: 2,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      totalSeconds: 7200,
    }

    mockCalculateTimeRemaining.mockReturnValue(mockTimeRemaining)

    const { unmount } = renderHook(() => useTimeRemaining(expiresAt))

    const clearIntervalSpy = jest.spyOn(global, "clearInterval")

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
