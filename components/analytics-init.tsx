"use client"

import { useEffect } from "react"
import { initializeAnalytics } from "@/lib/analytics"

/**
 * Component to initialize @deriv-com/analytics
 * Should be mounted once in the root layout
 */
export function AnalyticsInit() {
  useEffect(() => {
    initializeAnalytics()
  }, [])

  return null
}
