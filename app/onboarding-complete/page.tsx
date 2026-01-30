"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserDataStore } from "@/stores/user-data-store"
import { OnboardingComplete } from "@/components/onboarding-complete"
import { LoadingIndicator } from "@/components/loading-indicator"

export default function OnboardingCompletePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const userData = useUserDataStore((state) => state.userData)

  const isProfileCompleted = onboardingStatus?.profile?.status === "complete"
  const isPoiCompleted = onboardingStatus?.kyc?.poi_status === "approved"
  const isPoaCompleted = onboardingStatus?.kyc?.poa_status === "approved"
  const isPhoneCompleted = onboardingStatus?.p2p?.criteria?.find((c) => c.code === "phone_verified")?.passed || false

  useEffect(() => {
    // Give user data store time to load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // If not all verifications are complete, redirect to market
  useEffect(() => {
    if (!isLoading) {
      const allVerificationsComplete =
        isProfileCompleted && isPhoneCompleted && isPoiCompleted && isPoaCompleted

      if (!allVerificationsComplete) {
        router.push("/")
      }
    }
  }, [isLoading, isProfileCompleted, isPhoneCompleted, isPoiCompleted, isPoaCompleted, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIndicator />
      </div>
    )
  }

  return <OnboardingComplete onClose={() => router.push("/")} />
}
