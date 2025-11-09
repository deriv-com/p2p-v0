"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

/**
 * Hook to get and manage the wallet search parameter
 * Returns the wallet parameter value and utilities to append it to URLs
 */
export function useWalletParam() {
  const searchParams = useSearchParams()
  const walletParam = searchParams.get("wallet")

  const appendWalletParam = useMemo(() => {
    return (url: string): string => {
      if (!walletParam) return url

      try {
        const urlObj = new URL(url, window.location.origin)
        urlObj.searchParams.set("wallet", walletParam)
        return urlObj.pathname + urlObj.search
      } catch {
        // If URL parsing fails, manually append
        const separator = url.includes("?") ? "&" : "?"
        return `${url}${separator}wallet=${walletParam}`
      }
    }
  }, [walletParam])

  return {
    walletParam,
    appendWalletParam,
    hasWalletParam: !!walletParam,
  }
}
