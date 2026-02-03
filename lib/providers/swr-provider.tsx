"use client"

import { SWRConfig } from "swr"
import type { ReactNode } from "react"

const defaultOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: 60000, // Global 1 minute deduping
}

export function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map(), ...defaultOptions }}>{children}</SWRConfig>
}
