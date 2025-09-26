"use client"

import { useEffect, useState } from "react"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

interface UseKycVerificationOptions {
  autoShowSheet?: boolean
  fetchOnMount?: boolean
}

interface UseKycVerificationReturn {
  isPoiVerified: boolean
  isPoaVerified: boolean
  isKycVerified: boolean
  isLoading: boolean
  error: string | null
  isSheetOpen: boolean
  showKycSheet: () => void
  hideKycSheet: () => void
  fetchKycStatus: () => Promise<void>
  checkKycAndShowSheet: () => Promise<boolean>
}

export function useKycVerification(options: UseKycVerificationOptions = {}): UseKycVerificationReturn {
  const { autoShowSheet = false, fetchOnMount = false } = options

  const { isSheetOpen, isPoiVerified, isPoaVerified, isLoading, error, setSheetOpen, fetchKycStatus, resetError } =
    useKycOnboardingStore()

  const [hasAutoShown, setHasAutoShown] = useState(false)

  const isKycVerified = isPoiVerified && isPoaVerified

  useEffect(() => {
    if (fetchOnMount) {
      fetchKycStatus()
    }
  }, [fetchOnMount, fetchKycStatus])

  useEffect(() => {
    if (autoShowSheet && !isLoading && !hasAutoShown && !isKycVerified && !error) {
      setSheetOpen(true)
      setHasAutoShown(true)
    }
  }, [autoShowSheet, isLoading, hasAutoShown, isKycVerified, error, setSheetOpen])

  const showKycSheet = () => {
    resetError()
    setSheetOpen(true)
  }

  const hideKycSheet = () => {
    setSheetOpen(false)
  }

  const checkKycAndShowSheet = async (): Promise<boolean> => {
    try {
      await fetchKycStatus()
      const store = useKycOnboardingStore.getState()
      const isVerified = store.isPoiVerified && store.isPoaVerified

      if (!isVerified) {
        setSheetOpen(true)
        return false
      }

      return true
    } catch (error) {
      setSheetOpen(true)
      return false
    }
  }

  return {
    isPoiVerified,
    isPoaVerified,
    isKycVerified,
    isLoading,
    error,
    isSheetOpen,
    showKycSheet,
    hideKycSheet,
    fetchKycStatus,
    checkKycAndShowSheet,
  }
}
