import { calculateTimeRemaining, formatTimeRemaining, getTimeRemainingColor } from "@/lib/time-utils"
import jest from "jest"

describe("time-utils", () => {
  beforeEach(() => {
    // Mock Date.now() to return a consistent timestamp
    jest.spyOn(Date, "now").mockReturnValue(new Date("2023-01-01T12:00:00Z").getTime())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("calculateTimeRemaining", () => {
    it("should calculate time remaining correctly", () => {
      const futureDate = new Date("2023-01-01T14:30:45Z").toISOString()
      const result = calculateTimeRemaining(futureDate)

      expect(result).toEqual({
        hours: 2,
        minutes: 30,
        seconds: 45,
        totalSeconds: 9045,
        isExpired: false,
      })
    })

    it("should return expired state for past dates", () => {
      const pastDate = new Date("2023-01-01T10:00:00Z").toISOString()
      const result = calculateTimeRemaining(pastDate)

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      })
    })

    it("should handle minutes only", () => {
      const futureDate = new Date("2023-01-01T12:15:30Z").toISOString()
      const result = calculateTimeRemaining(futureDate)

      expect(result).toEqual({
        hours: 0,
        minutes: 15,
        seconds: 30,
        totalSeconds: 930,
        isExpired: false,
      })
    })
  })

  describe("formatTimeRemaining", () => {
    it("should format hours and minutes", () => {
      const timeRemaining = {
        hours: 2,
        minutes: 30,
        seconds: 45,
        totalSeconds: 9045,
        isExpired: false,
      }

      expect(formatTimeRemaining(timeRemaining)).toBe("2h 30m left")
    })

    it("should format minutes only", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 15,
        seconds: 30,
        totalSeconds: 930,
        isExpired: false,
      }

      expect(formatTimeRemaining(timeRemaining)).toBe("15m left")
    })

    it("should show less than 1 minute for seconds only", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 0,
        seconds: 45,
        totalSeconds: 45,
        isExpired: false,
      }

      expect(formatTimeRemaining(timeRemaining)).toBe("< 1m left")
    })

    it("should show expired for expired time", () => {
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

      expect(getTimeRemainingColor(timeRemaining)).toBe("text-red-500")
    })

    it("should return orange for 5-30 minutes", () => {
      const timeRemaining = {
        hours: 0,
        minutes: 15,
        seconds: 0,
        totalSeconds: 900,
        isExpired: false,
      }

      expect(getTimeRemainingColor(timeRemaining)).toBe("text-orange-500")
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
