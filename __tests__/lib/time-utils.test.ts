import { calculateTimeRemaining, formatTimeRemaining, getTimeRemainingColor } from "@/lib/time-utils"
import jest from "jest"

// Mock Date.now() for consistent testing
const mockNow = new Date("2024-01-01T12:00:00Z").getTime()
jest.spyOn(Date, "now").mockImplementation(() => mockNow)

describe("time-utils", () => {
  describe("calculateTimeRemaining", () => {
    it("should calculate time remaining correctly", () => {
      const expiresAt = new Date("2024-01-01T13:30:45Z").toISOString() // 1h 30m 45s from now
      const result = calculateTimeRemaining(expiresAt)

      expect(result).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 45,
        totalSeconds: 5445,
        isExpired: false,
      })
    })

    it("should return expired state for past dates", () => {
      const expiresAt = new Date("2024-01-01T11:00:00Z").toISOString() // 1 hour ago
      const result = calculateTimeRemaining(expiresAt)

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      })
    })

    it("should handle edge case of exactly expired", () => {
      const expiresAt = new Date("2024-01-01T12:00:00Z").toISOString() // exactly now
      const result = calculateTimeRemaining(expiresAt)

      expect(result.isExpired).toBe(true)
    })
  })

  describe("formatTimeRemaining", () => {
    it("should format hours and minutes correctly", () => {
      const timeRemaining = {
        hours: 2,
        minutes: 30,
        seconds: 15,
        totalSeconds: 9015,
        isExpired: false,
      }
      expect(formatTimeRemaining(timeRemaining)).toBe("2h 30m left")
    })

    it("should format minutes only when hours is 0", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 45,
        seconds: 30,
        totalSeconds: 2730,
        isExpired: false,
      }
      expect(formatTimeRemaining(timeRemaining)).toBe("45m left")
    })

    it("should show '< 1m left' for less than a minute", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 0,
        seconds: 30,
        totalSeconds: 30,
        isExpired: false,
      }
      expect(formatTimeRemaining(timeRemaining)).toBe("< 1m left")
    })

    it("should show 'Expired' for expired time", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      }
      expect(formatTimeRemaining(timeRemaining)).toBe("Expired")
    })
  })

  describe("getTimeRemainingColor", () => {
    it("should return red for expired", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      }
      expect(getTimeRemainingColor(timeRemaining)).toBe("text-red-600")
    })

    it("should return red for less than 5 minutes", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 3,
        seconds: 0,
        totalSeconds: 180,
        isExpired: false,
      }
      expect(getTimeRemainingColor(timeRemaining)).toBe("text-red-600")
    })

    it("should return orange for 5-30 minutes", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 15,
        seconds: 0,
        totalSeconds: 900,
        isExpired: false,
      }
      expect(getTimeRemainingColor(timeRemaining)).toBe("text-orange-600")
    })

    it("should return green for more than 30 minutes", () => {
      const timeRemaining = {
        hours: 1,
        minutes: 0,
        seconds: 0,
        totalSeconds: 3600,
        isExpired: false,
      }
      expect(getTimeRemainingColor(timeRemaining)).toBe("text-green-600")
    })
  })
})
