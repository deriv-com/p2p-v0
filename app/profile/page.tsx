"use client"

import { useState, useEffect } from "react"
import { USER } from "@/lib/local-variables"
//import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

export default function ProfilePage() {
  const [isKycSheetOpen, setIsKycSheetOpen] = useState(false)
  //const { showWarningDialog } = useAlertDialog()

  useEffect(() => {
    setIsKycSheetOpen(true)
    console.log("mounted")
  }, [])

  return (
    <>
      <KycOnboardingSheet isSheetOpen={isKycSheetOpen} setSheetOpen={setIsKycSheetOpen} />
    </>
  )
}
