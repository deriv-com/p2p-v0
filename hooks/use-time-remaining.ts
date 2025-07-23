"use client"

import { useState, useEffect } from "react"
import { calculateTimeRemaining, type TimeRemaining } from "@/lib/time-utils"

export function useTimeRemaining(expiresAt: string | null): TimeRemaining | null {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)

  useEffect(() => {
    if (!expiresAt) {
      setTimeRemaining(null)
      return
    }

    const updateTimeRemaining = () => {
      const remaining = calculateTimeRemaining(expiresAt)
      setTimeRemaining(remaining)
    }

    // Update immediately
    updateTimeRemaining()

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  return timeRemaining
}
