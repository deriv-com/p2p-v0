"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { Button } from "@/components/ui/button"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"
import { useTranslations } from "@/lib/i18n/use-translations"

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  className?: string
  redirectToAds?: boolean
  onAddPaymentMethod?: () => void
}

export default function EmptyState({
  icon,
  title = "No ads available",
  description,
  className,
  redirectToAds = false,
  onAddPaymentMethod,
}: EmptyStateProps) {
  const router = useRouter()
  const userId = useUserDataStore((state) => state.userId)
  const verificationStatus = useUserDataStore((state) => state.verificationStatus)
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const isPoiExpired = onboardingStatus?.kyc?.poi_status === "expired"
  const isPoaExpired = onboardingStatus?.kyc?.poa_status === "expired"
  const { showAlert } = useAlertDialog()
  const { t } = useTranslations()

  const createAd = () => {
    if (userId && verificationStatus?.phone_verified && !isPoiExpired && !isPoaExpired) {
      router.push("/ads/create")
    } else {
      const title = t("profile.gettingStarted")
      
      if(isPoiExpired && isPoaExpired) title = "Verification expired"
      else if(isPoiExpired) title = "Identity verification expired"
      else if(isPoaExpired) title = "Address verification expired"
      showAlert({
        title,
        description: (
          <div className="space-y-4 my-2">
            <KycOnboardingSheet />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
      })
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
      <Image src={icon || "/icons/search-icon.svg"} alt="No ads found" width={88} height={88} />
      {title && <p className="text-lg text-neutral-10 mt-2 font-bold">{title}</p>}
      {description && <p className="text-base font-normal text-grayscale-text-muted mb-[10px] mt-2">{description}</p>}
      {redirectToAds && (
        <Button onClick={createAd} className="mt-4">
          {t("myAds.createAd")}
        </Button>
      )}
      {onAddPaymentMethod && (
        <Button onClick={onAddPaymentMethod} className="mt-4">
          {t("profile.addPaymentMethod")}
        </Button>
      )}
    </div>
  )
}
