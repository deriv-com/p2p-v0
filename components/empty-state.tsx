"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { Button } from "@/components/ui/button"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

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
  const { showAlert } = useAlertDialog()

  const createAd = () => {
    if (userId) {
      router.push("/ads/create")
    } else {
      showAlert({
        title: "Getting started with P2P",
        description: (
          <div className="space-y-4 mb-6 mt-2">
            <KycOnboardingSheet />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined
      })
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
      <Image
        src={icon || "/icons/search-icon.svg"}
        alt="No ads found"
        width={88}
        height={88}
      />
      {title && <p className="text-lg text-neutral-10 mt-[24px] font-bold">{title}</p>}
      {description && <p className="text-base text-neutral-7 mb-[10px] mt-[8px]">{description}</p>}
      {redirectToAds && (
        <Button onClick={createAd} className="mt-[24px]">
          Create ad
        </Button>
      )}
    </div>
  )
}
