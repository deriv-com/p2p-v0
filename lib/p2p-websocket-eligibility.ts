import type { OnboardingStatusResponse } from "@/services/api/api-auth"
import { useUserDataStore, type UserData } from "@/stores/user-data-store"

const P2P_PROFILE_COMPLETE = "complete"
const KYC_APPROVED = "approved"
const PHONE_VERIFIED = "phone_verified"

interface P2PWebSocketEligibilityState {
  userId: string | null
  userData: UserData | null
  onboardingStatus: OnboardingStatusResponse | null
}

export function isP2PWebSocketEligibleFromState({
  userId,
  userData,
  onboardingStatus,
}: P2PWebSocketEligibilityState): boolean {
  if (!userId || !onboardingStatus?.p2p?.allowed) return false

  if (userData?.signup === "v1") {
    return true
  }

  return (
    onboardingStatus.tnc?.accepted === true &&
    onboardingStatus.profile?.status === P2P_PROFILE_COMPLETE &&
    onboardingStatus.kyc?.poi_status === KYC_APPROVED &&
    onboardingStatus.kyc?.poa_status === KYC_APPROVED &&
    onboardingStatus.p2p.criteria?.some((criterion) => criterion.code === PHONE_VERIFIED && criterion.passed) === true
  )
}

export function isP2PWebSocketEligible(): boolean {
  const { userId, userData, onboardingStatus } = useUserDataStore.getState()

  return isP2PWebSocketEligibleFromState({
    userId,
    userData,
    onboardingStatus,
  })
}
