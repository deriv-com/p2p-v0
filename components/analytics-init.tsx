"use client"

import { useEffect } from "react"
import { initializeAnalytics } from "@/lib/analytics"

export function AnalyticsInit() {

  useEffect(() => {
    initializeAnalytics()
  }, [])

  return null
}
