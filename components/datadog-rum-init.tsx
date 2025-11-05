"use client"

import { useEffect } from "react"
import { initDatadog } from "@/lib/datadog"

export function DatadogRumInit() {
  console.log("[v0] DatadogRumInit: Component mounted")

  useEffect(() => {
    console.log("[v0] DatadogRumInit: useEffect running")
    initDatadog()
  }, [])

  return null
}
