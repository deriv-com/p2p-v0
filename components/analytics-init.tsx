"use client"

import { useEffect } from "react"
import { initDatadog } from "@/lib/analytics"

export function AnalyticsInit() {

  useEffect(() => {
    initDatadog()
  }, [])

  return null
}
