"use client"

import { useMemo } from "react"
import { useUserDataStore } from "@/stores/user-data-store"

export interface OnboardingGate {
  /** True while the user may NOT perform P2P actions yet (or status is still loading). */
  isBlocked: boolean
  /** True only when every onboarding criterion is satisfied. Inverse of `isBlocked`. */
  isFullyOnboarded: boolean
}

/**
 * Web mirror of mobile's `OnboardingGate` (lib/core/onboarding/onboarding_gate.dart).
 *
 * Returns whether the current user is a fully-onboarded P2P advertiser. Used by
 * the zero-balance warning banner and any other surface that should appear only
 * for fully-onboarded users (and stay hidden while the KYC onboarding bottom
 * sheet is still being shown).
 *
 * Criteria (v2 wallet users):
 *   - `p2p.allowed === true`
 *   - `tnc.accepted === true`
 *   - `profile.status === "complete"`
 *   - `kyc.poi_status === "approved"`
 *   - `kyc.poa_status === "approved"`
 *   - `p2p.criteria` includes `phone_verified` with `passed === true`
 *
 * v1 (migrated) users: backend may not back-fill POI/POA/phone fields. Trust
 * `p2p.allowed` alone — same exception mobile makes.
 *
 * While `onboardingStatus` is null (still loading) the gate defaults to
 * blocked so transactional surfaces never flash before the status confirms.
 */
export function useOnboardingGate(): OnboardingGate {
  const onboardingStatus = useUserDataStore((s) => s.onboardingStatus)
  const userData = useUserDataStore((s) => s.userData)
  const isV1 = userData?.signup === "v1"

  return useMemo(() => {
    if (!onboardingStatus) return { isBlocked: true, isFullyOnboarded: false }

    // Cast: OnboardingStatusResponse type is stale — actual runtime shape
    // includes `tnc.accepted`, `profile.status`, `kyc.poi_status`,
    // `kyc.poa_status` (used by KycOnboardingSheet today).
    const o = onboardingStatus as unknown as {
      kyc?: { poi_status?: string; poa_status?: string }
      tnc?: { accepted?: boolean }
      profile?: { status?: string }
      p2p?: {
        allowed?: boolean
        criteria?: Array<{ code?: string; passed?: boolean }>
      }
    }

    const p2pAllowed = o.p2p?.allowed === true

    if (isV1) {
      // v1 (migrated) users: trust isP2PAllowed because backend may not
      // back-fill POI/POA/phone for pre-existing accounts. Mirrors mobile.
      return { isBlocked: !p2pAllowed, isFullyOnboarded: p2pAllowed }
    }

    const tncOk = o.tnc?.accepted === true
    const profileOk = o.profile?.status === "complete"
    const poiOk = o.kyc?.poi_status === "approved"
    const poaOk = o.kyc?.poa_status === "approved"
    const phoneOk =
      o.p2p?.criteria?.find((c) => c?.code === "phone_verified")?.passed === true

    const isFullyOnboarded =
      p2pAllowed && tncOk && profileOk && poiOk && poaOk && phoneOk
    return { isBlocked: !isFullyOnboarded, isFullyOnboarded }
  }, [onboardingStatus, isV1])
}
