"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { getHomeUrl } from "@/lib/utils"
import { USER } from "@/lib/local-variables"

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
  <div
    className="w-full p-2 rounded-2xl border border-gray-200 hover:cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 flex items-center justify-center">
        <Image
          src={icon}
          alt={title}
          width={24}
          height={24}
        />
      </div>
      <div className="text-left text-slate-1200 text-base font-normal flex-1">
        {title}
      </div>
      <Image src="/icons/chevron-right-gray.png" alt="Go" width={24} height={24} />
    </div>
  </div>
)

export default function KycOnboardingSheet({ isSheetOpen, setSheetOpen }: KycOnboardingSheetProps) {
  const isMobile = useIsMobile()

  const handleProfileSetup = () => {
    setSheetOpen(false)
    window.location.href = `https://${getHomeUrl()}/dashboard/user-profile`
  }

  const OnboardingContent = () => (
    <div>
      <div className="my-8">
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
        <DrawerContent className="rounded-t-3xl border-0 p-0 max-h-[80vh] p-2">
          <OnboardingContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-xl font-bold">Get started with P2P</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <OnboardingContent />
        </div>
      </div>
    </div>
  )
}
