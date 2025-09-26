"use client"

import { useState, useEffect } from "react"
import { getKycStatus } from "@/services/api/api-auth"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

export function useKycStatus() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setKycStatus } = useKycOnboardingStore()

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const status = await getKycStatus()
        setKycStatus(status)
      } catch (err) {
        console.error("Failed to fetch KYC status:", err)
        setError("Failed to load KYC status")
      } finally {
        setIsLoading(false)
      }
    }

    if (typeof window !== "undefined") {
      fetchKycStatus()
    } else {
      setIsLoading(false)
    }
  }, [setKycStatus])

  return { isLoading, error }
}
