"use client"

import { useEffect } from "react"
import { initDatadog } from "@/lib/datadog"
import { initializeAnalytics } from "@/lib/analytics"

export function DatadogRumInit() {

  useEffect(() => {
    // Initialize both Datadog and Analytics in a single effect
    // to prevent duplicate script loads
    const initialize = async () => {
      try {
        initDatadog()
        await initializeAnalytics()
      } catch (error) {
        console.error("Initialization error:", error)
      }
    }
    
    initialize()
  }, [])

  return null
}
