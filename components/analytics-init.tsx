"use client"

import { useEffect } from "react"
import { initDatadog } from "@/lib/analytics"

export function initializeAnalytics() {

  useEffect(() => {
    initDatadog()
  }, [])

  return null
}
