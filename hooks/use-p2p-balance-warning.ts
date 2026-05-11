"use client"

import { useEffect, useState } from "react"

/**
 * Zero-balance warning banner gate for the Markets page.
 *
 * Shows when the user has a P2P profile AND their P2P balance is zero.
 * Mirrors the mobile app which reads `total_account_value.amount` from
 * `/users/me` — the same value flows into web's local `balance` state.
 *
 * ## Why this is stateful (latched) rather than pure
 *
 * A pure `isSignedUp && balance <= 0` derivation flickers on Buy/Sell tab
 * switches: one of the inputs (typically `isLoadingBalance` from a zustand
 * re-render chain) transiently reads as a value that makes `shouldShow`
 * compute to `false` for a single render, then flips back.
 *
 * The latch decouples the render cycle from the decision:
 *   - A transient `undefined` (loading / unknown) never changes state.
 *   - Only a definitive `parseFloat(balance) > 0` observation hides it.
 *   - Only a definitive `parseFloat(balance) <= 0` observation shows it.
 *
 * Initial state is `true` — conservative default so the banner stays
 * visible until we *definitively* know the P2P balance is positive.
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
    const parsed = Number.parseFloat(p2pBalance)
    const isPositive = Number.isFinite(parsed) && parsed > 0
    setShouldShow(!isPositive)
  }, [p2pBalance, isSignedUp])

  return { shouldShow }
}
