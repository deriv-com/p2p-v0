"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

interface OnboardingStepProps {
  icon: string
  title: string
  subtitle: string
  completed: boolean
  onClick: () => void
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ icon, title, subtitle, completed, onClick }) => (
  <Button
    variant="ghost"
    className="w-full h-auto p-4 justify-between hover:bg-gray-50 rounded-lg border border-gray-200"
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center">
        <Image
          src={icon || "/placeholder.svg"}
          alt={title}
          width={24}
          height={24}
          className={completed ? "opacity-50" : ""}
        />
      </div>
      <div className="text-left">
        <div className={`font-medium text-base ${completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
          {title}
        </div>
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      </div>
    </div>
    <div className="flex items-center">
      {completed ? (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <Image src="/icons/check-white.png" alt="Completed" width={12} height={12} />
        </div>
      ) : (
        <Image src="/icons/chevron-right.png" alt="Go" width={20} height={20} />
      )}
    </div>
  </Button>
)

export const KycOnboardingSheet: React.FC = () => {
  const router = useRouter()
  const { isSheetOpen, profileCompleted, biometricsCompleted, setSheetOpen } = useKycOnboardingStore()

  const handleProfileSetup = () => {
    setSheetOpen(false)
    router.push("/profile")
  }

  const handleBiometricsSetup = () => {
    setSheetOpen(false)
    // Navigate to biometrics setup page when available
    console.log("Navigate to biometrics setup")
  }

  const handleClose = () => {
    setSheetOpen(false)
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 p-0 max-h-[80vh]">
        {/* Handle bar */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />

        <div className="px-6 pb-6">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-bold text-center text-gray-900">Get started with P2P</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <OnboardingStep
              icon="/icons/user-profile.png"
              title="Set up and verify your profile"
              subtitle="5 steps"
              completed={profileCompleted}
              onClick={handleProfileSetup}
            />

            <OnboardingStep
              icon="/icons/fingerprint.png"
              title="Add biometrics"
              subtitle="1 step"
              completed={biometricsCompleted}
              onClick={handleBiometricsSetup}
            />
          </div>

          <Button variant="ghost" className="w-full mt-6 text-gray-500" onClick={handleClose}>
            Skip for now
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
