import { calculateTimeRemaining, formatTimeRemaining, getTimeRemainingColor } from "@/lib/time-utils"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock Date.now() for consistent testing
const mockNow = new Date("2024-01-01T12:00:00Z").getTime()
jest.spyOn(Date, "now").mockImplementation(() => mockNow)

describe("Time Utils", () => {
  describe("calculateTimeRemaining", () => {
    it("should calculate time remaining correctly", () => {
      const expiresAt = new Date("2024-01-01T14:30:45Z").toISOString() // 2h 30m 45s from now
      const result = calculateTimeRemaining(expiresAt)

      expect(result.hours).toBe(2)
      expect(result.minutes).toBe(30)
      expect(result.seconds).toBe(45)
      expect(result.isExpired).toBe(false)
      expect(result.totalSeconds).toBe(9045)
    })

    it("should handle expired orders", () => {
      const expiresAt = new Date("2024-01-01T10:00:00Z").toISOString() // 2h ago
      const result = calculateTimeRemaining(expiresAt)

      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(0)
      expect(result.seconds).toBe(0)
      expect(result.isExpired).toBe(true)
      expect(result.totalSeconds).toBe(0)
    })

    it("should handle orders expiring in less than a minute", () => {
      const expiresAt = new Date("2024-01-01T12:00:30Z").toISOString() // 30s from now
      const result = calculateTimeRemaining(expiresAt)

      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(0)
      expect(result.seconds).toBe(30)
      expect(result.isExpired).toBe(false)
      expect(result.totalSeconds).toBe(30)
    })
  })

  describe("formatTimeRemaining", () => {
    it("should format hours and minutes correctly", () => {
      const timeRemaining = {
        hours: 2,
        minutes: 30,
        seconds: 45,
        isExpired: false,
        totalSeconds: 9045,
      }

      expect(formatTimeRemaining(timeRemaining)).toBe("2h 30m left")
    })

    it("should format minutes only when hours is 0", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 15,
        seconds: 30,
        isExpired: false,
        totalSeconds: 930,
      }

      expect(formatTimeRemaining(timeRemaining)).toBe("15m left")
    })

    it('should show "< 1m left" when less than a minute', () => {
      const timeRemaining = {
        hours: 0,
        minutes: 0,
        seconds: 30,
        isExpired: false,
        totalSeconds: 30,
      }

      expect(formatTimeRemaining(timeRemaining)).toBe("< 1m left")
    })

    it('should show "Expired" for expired orders', () => {
      const timeRemaining = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0,
      }

      expect(formatTimeRemaining(timeRemaining)).toBe("Expired")
    })
  })

  describe("getTimeRemainingColor", () => {
    it("should return red for expired orders", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0,
      }

      expect(getTimeRemainingColor(timeRemaining)).toBe("text-red-600")
    })

    it("should return red for orders with less than 5 minutes", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 3,
        seconds: 0,
        isExpired: false,
        totalSeconds: 180,
      }

      expect(getTimeRemainingColor(timeRemaining)).toBe("text-red-500")
    })

    it("should return orange for orders with less than 30 minutes", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 15,
        seconds: 0,
        isExpired: false,
        totalSeconds: 900,
      }

      expect(getTimeRemainingColor(timeRemaining)).toBe("text-orange-500")
    })

    it("should return green for orders with more than 30 minutes", () => {
      const timeRemaining = {
        hours: 2,
        minutes: 0,
        seconds: 0,
        isExpired: false,
        totalSeconds: 7200,
      }

      expect(getTimeRemainingColor(timeRemaining)).toBe("text-green-600")
    })
  })
})
