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
  redirectToMarket?: boolean
  onAddPaymentMethod?: () => void
  route?: string | null
}

export default function EmptyState({
  icon,
  title = "No ads available",
  description,
  className,
  redirectToAds = false,
  redirectToMarket = false,
  onAddPaymentMethod,
  route,
}: EmptyStateProps) {
  const router = useRouter()
  const userId = useUserDataStore((state) => state.userId)
  const verificationStatus = useUserDataStore((state) => state.verificationStatus)
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const isPoiExpired = userId && onboardingStatus?.kyc?.poi_status !== "approved"
  const isPoaExpired = userId && onboardingStatus?.kyc?.poa_status !== "approved"
  const { showAlert } = useAlertDialog()
  const { t } = useTranslations()

  const createAd = () => {
    if (userId && verificationStatus?.phone_verified && !isPoiExpired && !isPoaExpired) {
      router.push("/ads/create")
    } else {
      const title = t("profile.gettingStarted")

      if(isPoiExpired && isPoaExpired) title = t("profile.verificationExpired")
      else if(isPoiExpired) title = t("profile.identityVerificationExpired")
      else if(isPoaExpired) title = t("profile.addressVerificationExpired")

      showAlert({
        title,
        description: (
          <div className="space-y-4 my-2">
            <KycOnboardingSheet route={route || "ads"} />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
      })
    }
  }

  const browseMarket = () => {
    router.push("/")
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center px-3 md:px-0 md:w-max justify-self-center", className)}>
      <Image src={icon || "/icons/search-icon.svg"} alt="No ads found" width={88} height={88} />
      {title && <p className="text-base text-slate-1200 mt-2 font-bold">{title}</p>}
      {description && <p className="text-base font-normal text-grayscale-600 mb-2">{description}</p>}
      <div className="flex w-full gap-2 justify-center flex-wrap-reverse mt-4">
        {redirectToMarket && (
          <Button onClick={browseMarket} className={cn("basis-auto grow shrink", redirectToMarket && redirectToAds && "w-full")} variant="outline">
            {t("market.browseMarket")}
          </Button>
        )}
        {redirectToAds && (
          <Button onClick={createAd} className="basis-auto grow shrink">
            {t("myAds.createAd")}
          </Button>
        )}
      </div>
      {onAddPaymentMethod && (
        <Button onClick={onAddPaymentMethod} className="mt-4">
          {t("profile.addPaymentMethod")}
        </Button>
      )}
    </div>
  )
}
