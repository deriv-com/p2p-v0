"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

interface KycOnboardingSheetProps {
  isSheetOpen: boolean
  setSheetOpen: (open: boolean) => void
}

interface OnboardingStepProps {
  icon: string
  title: string
  completed: boolean
  onClick: () => void
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ icon, title, completed, onClick }) => (
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
      </div>
    </div>
    <div className="flex items-center">
      {completed ? (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <Image src="/white-checkmark-icon.jpg" alt="Completed" width={12} height={12} />
        </div>
      ) : (
        <Image src="/chevron-right-arrow.jpg" alt="Go" width={20} height={20} />
      )}
    </div>
  </Button>
)

export const KycOnboardingSheet: React.FC<KycOnboardingSheetProps> = ({ isSheetOpen, setSheetOpen }) => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const { isPoiVerified, isPoaVerified, isLoading, error } = useKycOnboardingStore()

  const handleProfileSetup = () => {
    setSheetOpen(false)
    router.push("/profile")
  }

  const handlePoiVerification = () => {
    setSheetOpen(false)
    // Navigate to POI verification page or external service
    // This would typically redirect to the KYC provider's POI flow
    window.open(process.env.NEXT_PUBLIC_KYC_POI_URL || "/profile?tab=identity", "_blank")
  }

  const handlePoaVerification = () => {
    setSheetOpen(false)
    // Navigate to POA verification page or external service
    // This would typically redirect to the KYC provider's POA flow
    window.open(process.env.NEXT_PUBLIC_KYC_POA_URL || "/profile?tab=address", "_blank")
  }

  const OnboardingContent = () => (
    <>
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />

      <div className="px-6 pb-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">Complete your verification</h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            To create ads on P2P, you need to verify your identity and address.
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Checking verification status...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4 mb-6">
            <OnboardingStep
              icon="/user-profile-icon.png"
              title="Verify your identity (POI)"
              completed={isPoiVerified}
              onClick={handlePoiVerification}
            />

            <OnboardingStep
              icon="/address-icon.png"
              title="Verify your address (POA)"
              completed={isPoaVerified}
              onClick={handlePoaVerification}
            />

            <OnboardingStep
              icon="/user-profile-icon.png"
              title="Set up and verify your profile"
              completed={isPoiVerified && isPoaVerified}
              onClick={handleProfileSetup}
            />
          </div>
        )}

        {isPoiVerified && isPoaVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-3">
                <Image src="/white-checkmark-icon.jpg" alt="Completed" width={12} height={12} />
              </div>
              <p className="text-sm text-green-700 font-medium">Verification complete! You can now create ads.</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSheetOpen(false)} className="flex-1">
            Close
          </Button>
          {isPoiVerified && isPoaVerified && (
            <Button onClick={() => setSheetOpen(false)} className="flex-1">
              Continue
            </Button>
          )}
        </div>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={isSheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className="rounded-t-3xl border-0 p-0 max-h-[80vh]">
          <OnboardingContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="rounded-t-3xl border-0 p-0 max-h-[80vh]">
        <OnboardingContent />
      </SheetContent>
    </Sheet>
  )
}
