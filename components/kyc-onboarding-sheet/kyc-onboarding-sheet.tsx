"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { getHomeUrl } from "@/lib/utils"

interface KycOnboardingSheetProps {
  isSheetOpen: boolean
  setSheetOpen: (open: boolean) => void
}

interface OnboardingStepProps {
  icon: string
  title: string
  onClick: () => void
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ icon, title, onClick }) => (
  <div
    className="w-full p-2 rounded-2xl border border-gray-200"
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center">
        <Image
          src={icon}
          alt={title}
          width={24}
          height={24}
        />
      </div>
      <div className="text-left text-slate-1200 text-base font-normal">
        {title}
      </div>
    </div>
    <div className="flex items-center">
      <Image src="/icons/chevron-right-sm.png" alt="Go" width={24} height={24} />
    </div>
  </div>
)

export const KycOnboardingSheet: React.FC<KycOnboardingSheetProps> = ({ isSheetOpen, setSheetOpen }) => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const handleProfileSetup = () => {
    setSheetOpen(false)
    router.push("/profile")
  }

  const OnboardingContent = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-center text-slate-1200">Get started with P2P</h2>
      </div>

      <div className="space-y-4 mb-6">
        <OnboardingStep
          icon="/icons/account-profile.png"
          title="Set up and verify your profile"
          onClick={handleProfileSetup}
        />
      </div>
    </div>
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
      <SheetContent>
        <OnboardingContent />
      </SheetContent>
    </Sheet>
  )
}
