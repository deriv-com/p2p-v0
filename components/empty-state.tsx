"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { USER } from "@/lib/local-variables"
import { Button } from "@/components/ui/button"
import { KycOnboardingSheet } from "./kyc-onboarding-sheet/kyc-onboarding-sheet"

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
  const [isKycSheetOpen, setIsKycSheetOpen] = useState(false)

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
          <Button onClick={() => router.push("/ads/create")} className="mt-[24px]">
            Create ad
          </Button>
        )}
      </div>

      <KycOnboardingSheet isSheetOpen={isKycSheetOpen} setSheetOpen={setIsKycSheetOpen} />
    </>
  )
}
