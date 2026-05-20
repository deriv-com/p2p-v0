"use client"

import { useEffect, useRef, useState } from "react"

const STABILITY_WINDOW_MS = 500

function isBalancePositive(balance: string | undefined): boolean {
  if (balance === undefined) return false
  const parsed = Number.parseFloat(balance)
  return Number.isFinite(parsed) && parsed > 0
}

/**
 * Zero-balance warning banner gate for the Markets page.
 *
 * Shows when the user is a v2 (wallet) advertiser, fully onboarded, AND
 * their P2P balance is zero. Mirrors the mobile app which reads
 * `total_account_value.amount` from `/users/me` — the same value flows
 * into web's local `balance` state. v1 (migrated) users are excluded
 * because they cannot access the wallet page, so the banner's Transfer
 * CTA would dead-end for them.
 *
 * ## Latched one-way, debounced
 *
 * A pure derivation flickers when the upstream `balance` value briefly
 * oscillates across a re-render (e.g. a `balance_change` WebSocket event
 * replay on tab switch). The hook therefore:
 *
 *   1. Latches state in `useState` rather than recomputing each render.
 *   2. Debounces decision changes through a [STABILITY_WINDOW_MS] timer —
 *      a fresh dep change within the window cancels the pending decision
 *      and schedules a new one. Only a value that stays settled for the
 *      full window flips `shouldShow`.
 *   3. Is one-way: once `shouldShow` goes `false` (balance confirmed
 *      positive), it stays `false` for the session. A subsequent
 *      transient 0 cannot re-show the banner. A real transfer-out flow
 *      is handled on the next page load / fresh session.
 *   4. Ignores transient `undefined` (loading / unknown) inputs.
 *
 * Default state is `false` (hidden). The first debounced observation
 * decides: definitive zero → show; definitive positive → latch hidden
 * forever. This guarantees positive-balance users never see a flash of
 * the banner during page load.
 */
export function useP2PBalanceWarning(
  p2pBalance: string | undefined,
  isFullyOnboarded: boolean,
  isV2User: boolean,
): { shouldShow: boolean } {
  const [shouldShow, setShouldShow] = useState(false)
  const hasConfirmedPositive = useRef(false)

  useEffect(() => {
    // One-way latch — once we've confirmed a positive balance, stay
    // hidden for the rest of the session. Transient 0s can't re-show.
    if (hasConfirmedPositive.current) return
    const timeoutId = setTimeout(() => {
      // `!isFullyOnboarded`, `!isV2User`, and `undefined` balance are
      // UNKNOWN/ineligible states, not commit signals. Skipping here
      // means a transient stale selector return on tab switch cannot
      // flip the banner — we only commit when we have a definitive
      // positive/zero balance observation for an eligible user. Actual
      // logout unmounts this hook, so no explicit hide needed.
      if (!isV2User) return
      if (!isFullyOnboarded) return
      if (p2pBalance === undefined) return
      if (isBalancePositive(p2pBalance)) {
        hasConfirmedPositive.current = true
        setShouldShow(false)
      } else {
        setShouldShow(true)
      }
    }, STABILITY_WINDOW_MS)
    return () => clearTimeout(timeoutId)
  }, [p2pBalance, isFullyOnboarded, isV2User])

  return { shouldShow }
}
