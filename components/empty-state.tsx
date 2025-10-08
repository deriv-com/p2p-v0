"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { Button } from "@/components/ui/button"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getHomeUrl } from "@/lib/utils"

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  className?: string
  redirectToAds?: boolean
}

export default function EmptyState({
  icon,
  title = "No ads available",
  description,
  className,
  redirectToAds = false,
}: EmptyStateProps) {
  const router = useRouter()
  const userId = useUserDataStore((state) => state.userId)
  const { showAlert, hideAlert } = useAlertDialog()

  const OnboardingStep = ({ icon, title, onClick }) => (
    <div
      className="w-full p-2 rounded-2xl md:rounded-none border md:border-none md:border-b border-gray-200 hover:cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 flex items-center justify-center">
          <Image src={icon || "/placeholder.svg"} alt={title} width={24} height={24} />
        </div>
        <div className="text-left text-slate-1200 text-base font-normal flex-1">{title}</div>
        <Image src="/icons/chevron-right-gray.png" alt="Go" width={24} height={24} />
      </div>
    </div>
  )

  const createAd = () => {
    if (userId) {
      router.push("/ads/create")
    } else {
      showAlert({
        title: "Get started with P2P",
        description: (
          <div className="space-y-4 mb-6 mt-2">
            <OnboardingStep
              icon="/icons/account-profile.png"
              title="Set up and verify your profile"
              onClick={() => {
                  window.location.href = `https://${getHomeUrl()}/dashboard/userprofile`
                  //setIsKycSheetOpen(false)
              }}
            />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
        onCancel: () => setIsKycSheetOpen(false),
      })
    }
  }

  return (
    <>
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <Image
          src={icon || "/icons/search-icon.png"}
          alt="No ads found"
          width={56}
          height={56}
          className="opacity-60"
        />
        {title && <p className="text-lg text-neutral-10 mt-[24px] font-bold">{title}</p>}
        {description && <p className="text-base text-neutral-7 mb-[10px] mt-[8px]">{description}</p>}
        {redirectToAds && (
          <Button onClick={createAd} className="mt-[24px]">
            Create ad
          </Button>
        )}
      </div>
    </>
  )
}
