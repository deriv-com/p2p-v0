"use client"

/**
 * Zero-balance warning banner gate for the Markets page.
 *
 * Shows when the user has a P2P profile (i.e. `signup` is set — brand-new
 * pre-onboarding users have no `signup` value and `fetchBalance` skips them)
 * AND their P2P balance is exactly zero.
 *
 * Non-dismissible — stays visible the entire time balance is zero and
 * disappears once balance > 0.
 */
export function useP2PBalanceWarning(balance: string, isSignedUp: boolean): { shouldShow: boolean } {
  const parsed = Number.parseFloat(balance)
  const isZero = Number.isFinite(parsed) && parsed <= 0
  return { shouldShow: isSignedUp && isZero }
}
