"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

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
          src={icon}
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

export const KycOnboardingSheet: React.FC = () => {
  const router = useRouter()
  const isMobile = useIsMobile()
  const handleProfileSetup = () => {
    setSheetOpen(false)
    router.push("/profile")
  }

  const OnboardingContent = () => (
    <>
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />

      <div className="px-6 pb-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">Get started with P2P</h2>
        </div>

        <div className="space-y-4 mb-6">
          <OnboardingStep
            icon="/user-profile-icon.png"
            title="Set up and verify your profile"
            completed={true}
            onClick={handleProfileSetup}
          />
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
