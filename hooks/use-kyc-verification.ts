"use client"

import { useEffect, useState } from "react"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

interface UseKycVerificationOptions {
  autoShowSheet?: boolean
  fetchOnMount?: boolean
}

interface UseKycVerificationReturn {
  isPoiVerified: boolean
  /** Whether POA (Proof of Address) is verified */
  isPoaVerified: boolean
  /** Whether both POI and POA are verified */
  isKycVerified: boolean
  /** Whether KYC status is currently being fetched */
  isLoading: boolean
  /** Any error that occurred while fetching KYC status */
  error: string | null
  /** Whether the KYC onboarding sheet is open */
  isSheetOpen: boolean
  /** Function to manually show the KYC onboarding sheet */
  showKycSheet: () => void
  /** Function to hide the KYC onboarding sheet */
  hideKycSheet: () => void
  /** Function to manually fetch KYC status */
  fetchKycStatus: () => Promise<void
  checkKycAndShowSheet: () => Promise<boolean>
}

export function useKycVerification(options: UseKycVerificationOptions = {}): UseKycVerificationReturn {
  const { autoShowSheet = false, fetchOnMount = false } = options

  const { isSheetOpen, isPoiVerified, isPoaVerified, isLoading, error, setSheetOpen, fetchKycStatus, resetError } =
    useKycOnboardingStore()

  const [hasAutoShown, setHasAutoShown] = useState(false)

  const isKycVerified = isPoiVerified && isPoaVerified

  // Fetch KYC status on mount if requested
  useEffect(() => {
    if (fetchOnMount) {
      fetchKycStatus()
    }
  }, [fetchOnMount, fetchKycStatus])

  // Auto-show sheet when verification is incomplete
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

      // Check if verification is complete after fetching
      const store = useKycOnboardingStore.getState()
      const isVerified = store.isPoiVerified && store.isPoaVerified

      if (!isVerified) {
        setSheetOpen(true)
        return false
      }

      return true
    } catch (error) {
      // Show sheet even on error to allow user to try again
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
