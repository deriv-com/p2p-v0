"use client"

/**
 * Zero-balance warning banner gate for the Markets page.
 *
 * Shows when the user has a P2P profile AND their **P2P wallet** balance is
 * zero. Checks the P2P wallet specifically — not the total account value —
 * so main-wallet funds don't hide the banner.
 *
 * Conservative default: while P2P balance is still loading (`undefined`),
 * the banner stays visible. It only hides once we've definitively seen a
 * positive P2P balance. This prevents flicker on re-renders where the
 * balance source is momentarily unknown.
 */
export function useP2PBalanceWarning(
  p2pBalance: string | undefined,
  isSignedUp: boolean,
): { shouldShow: boolean } {
  if (!isSignedUp) return { shouldShow: false }
  if (p2pBalance === undefined) return { shouldShow: true }
  const parsed = Number.parseFloat(p2pBalance)
  const isPositive = Number.isFinite(parsed) && parsed > 0
  return { shouldShow: !isPositive }
}
