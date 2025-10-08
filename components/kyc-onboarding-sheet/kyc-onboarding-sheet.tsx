"use client"

import Image from "next/image"
import { useEffect } from "react"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getHomeUrl } from "@/lib/utils"

interface KycOnboardingSheetProps {
  isSheetOpen?: boolean
  setSheetOpen: (open: boolean) => void
}

interface OnboardingStepProps {
  icon: string
  title: string
  onClick: () => void
}

const OnboardingStep = ({ icon, title, onClick }: OnboardingStepProps) => (
  <div className="w-full p-2 rounded-2xl md:rounded-none border md:border-none md:border-b border-gray-200 hover:cursor-pointer" onClick={onClick}>
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 flex items-center justify-center">
        <Image src={icon || "/placeholder.svg"} alt={title} width={24} height={24} />
      </div>
      <div className="text-left text-slate-1200 text-base font-normal flex-1">{title}</div>
      <Image src="/icons/chevron-right-gray.png" alt="Go" width={24} height={24} />
    </div>
  </div>
)

function KycOnboardingSheet({ isSheetOpen, setSheetOpen }: KycOnboardingSheetProps) {
  const { showAlert, hideAlert } = useAlertDialog()

  const handleProfileSetup = () => {
    hideAlert()
    setSheetOpen(false)
    window.location.href = `https://${getHomeUrl()}/dashboard/userprofile`
  }

  useEffect(() => {
    if (isSheetOpen) {
      showAlert({
        title: "Get started with P2P",
        description: (
          <div className="space-y-4 mb-6 mt-2">
            <OnboardingStep
              icon="/icons/account-profile.png"
              title="Set up and verify your profile"
              onClick={handleProfileSetup}
            />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
        onCancel: () => setSheetOpen(false),
      })
    } else {
      hideAlert()
    }
  }, [isSheetOpen])

  return null
}

export { KycOnboardingSheet }
export default KycOnboardingSheet
