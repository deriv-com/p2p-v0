"use client"

import { useEffect } from "react"
import { initDatadog } from "@/lib/analytics"

export function Analyticsinit() {

  useEffect(() => {
    initDatadog()
  }, [])

  return null
}
