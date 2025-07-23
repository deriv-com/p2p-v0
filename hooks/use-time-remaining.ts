"use client"

import { useState, useEffect } from "react"
import { calculateTimeRemaining, formatTimeRemaining } from "@/lib/time-utils"

export function useTimeRemaining(expiresAt: string): string {
  const [timeString, setTimeString] = useState<string>("")

  useEffect(() => {
    if (!expiresAt) {
      setTimeString("-")
      return
    }

    const updateTime = () => {
      const timeRemaining = calculateTimeRemaining(expiresAt)
      const formattedTime = formatTimeRemaining(timeRemaining)
      setTimeString(formattedTime)
    }

    // Update immediately
    updateTime()

    // Set up interval to update every second
    const interval = setInterval(updateTime, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [expiresAt])

  return timeString
}
