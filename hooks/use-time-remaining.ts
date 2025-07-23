"use client"

import { useState, useEffect, useRef } from "react"
import { calculateTimeRemaining, type TimeRemaining } from "@/lib/time-utils"

export function useTimeRemaining(expiresAt: string) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => calculateTimeRemaining(expiresAt))
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateTimeRemaining = () => {
      const newTimeRemaining = calculateTimeRemaining(expiresAt)
      setTimeRemaining(newTimeRemaining)

      // Stop updating if expired
      if (newTimeRemaining.isExpired && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Update immediately
    updateTimeRemaining()

    // Only set up interval if not expired
    if (!timeRemaining.isExpired) {
      intervalRef.current = setInterval(updateTimeRemaining, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [expiresAt])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return timeRemaining
}
