"use client"

import { useEffect, useState } from "react"

const STABILITY_WINDOW_MS = 500

/**
 * Zero-balance warning banner gate for the Markets page.
 *
 * Shows when the user has a P2P profile AND their P2P balance is zero.
 * Mirrors the mobile app which reads `total_account_value.amount` from
 * `/users/me` — the same value flows into web's local `balance` state.
 *
 * ## Latched + debounced
 *
 * A pure derivation flickers when the upstream `balance` value briefly
 * oscillates across a re-render (e.g. a `balance_change` WebSocket event
 * replay on tab switch). The hook therefore:
 *
 *   1. Latches state in `useState` rather than recomputing each render.
 *   2. Debounces decision changes through a [STABILITY_WINDOW_MS] timer —
 *      a fresh dep change within the window cancels the pending decision
 *      and schedules a new one. Only a value that stays settled for the
 *      full window actually flips `shouldShow`.
 *   3. Ignores transient `undefined` (loading / unknown) inputs.
 *
 * Initial state is `true` — conservative default so the banner shows
 * immediately on mount and stays visible until we *definitively* know
 * the P2P balance is positive.
 */
export function useP2PBalanceWarning(
  p2pBalance: string | undefined,
  isSignedUp: boolean,
): { shouldShow: boolean } {
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    if (!isSignedUp) {
      setShouldShow(false)
      return
    }
    if (p2pBalance === undefined) {
      // Loading / unknown — preserve whatever state we have.
      return
    }
    const timeoutId = setTimeout(() => {
      const parsed = Number.parseFloat(p2pBalance)
      const isPositive = Number.isFinite(parsed) && parsed > 0
      setShouldShow(!isPositive)
    }, STABILITY_WINDOW_MS)
    return () => clearTimeout(timeoutId)
  }, [p2pBalance, isSignedUp])

  return { shouldShow }
}
