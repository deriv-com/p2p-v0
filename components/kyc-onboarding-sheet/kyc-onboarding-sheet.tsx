"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn, getHomeUrl } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { useTranslations } from "@/lib/i18n/use-translations"

interface KycOnboardingSheetProps {
  route?: "markets" | "profile" | "wallets" | "ads"
}

function KycOnboardingSheet({ route }: KycOnboardingSheetProps) {
  const { t } = useTranslations()
  const { isWalletAccount } = useUserDataStore()
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const userId = useUserDataStore((state) => state.userId)
  const userData = useUserDataStore((state) => state.userData)
  const isV1Signup = userData?.signup === "v1"

  const isProfileCompleted =
    (onboardingStatus?.p2p?.criteria?.find((c) => c.code === "deposit_enabled")?.passed &&
      onboardingStatus?.p2p?.criteria?.find((c) => c.code === "withdraw_enabled")?.passed) ||
    false
  const isPoiCompleted = onboardingStatus?.kyc?.poi_status === "approved"
  const isPoaCompleted = onboardingStatus?.kyc?.poa_status === "approved"
  const isPoiExpired = userId && !isPoiCompleted
  const isPoaExpired = userId && !isPoaCompleted
  const isPhoneCompleted = onboardingStatus?.p2p?.criteria?.find((c) => c.code === "phone_verified")?.passed || false

  const getFromParam = () => {
    if (!route) return "from=p2p"

    switch (route) {
      case "markets":
        return "from=p2p"
      case "profile":
        return "from=p2p-profile"
      case "wallets":
        return "from=p2p-wallet"
      case "ads":
        return "from=p2p-ads"
      default:
        return "from=p2p"
    }
  }

  const fromParam = getFromParam()

  const allVerificationSteps = [
    {
      id: "profile",
      title: t("kyc.setupProfile"),
      icon: "/icons/account-profile.png",
      completed: isProfileCompleted,
      link: `https://${getHomeUrl(isV1Signup)}/dashboard/onboarding/personal-details?is_from_p2p=true&${fromParam}`,
    },
    {
      id: "phone",
      title: t("kyc.phoneNumber"),
      icon: "/icons/pnv.png",
      completed: isPhoneCompleted,
      link: `https://${getHomeUrl(isV1Signup)}/dashboard/details?is_from_p2p=true&${fromParam}`,
    },
    {
      id: "poi",
      title: t("kyc.proofOfIdentity"),
      icon: "/icons/poi.png",
      completed: isPoiCompleted,
      expired: isPoiExpired,
      link: getHomeUrl(isV1Signup, "poi", isWalletAccount, fromParam),
    },
    {
      id: "poa",
      title: t("kyc.proofOfAddress"),
      icon: "/icons/poa.png",
      completed: isPoaCompleted,
      expired: isPoaExpired,
      link: getHomeUrl(isV1Signup, "poa", isWalletAccount, fromParam),
    },
  ]

  const hasExpiredSteps = isPoiExpired || isPoaExpired
  const verificationSteps = hasExpiredSteps
    ? allVerificationSteps.filter((step) => {
        if (isPoiExpired && step.id === "poi") return true
        if (isPoaExpired && step.id === "poa") return true
        return false
      })
    : allVerificationSteps

  const getDescription = () => {
    if(hasExpiredSteps){
      if(isPoiExpired && isPoaExpired) return t("kyc.resubmitIdentityAndAddress")
      else if(isPoiExpired) return t("kyc.resubmitIdentity")
      else if(isPoaExpired) return t("kyc.resubmitAddress")
    } 

    return t("kyc.accessP2PMessage")
  }

  const handlePoiPoaExpiredLink = () => {
    if(isPoiExpired) window.location.href = getHomeUrl(isV1Signup, "poi")
    else window.location.href = getHomeUrl(isV1Signup, "poa")
  }

  const handleStepClick = (link) => {
    window.location.href = link
  }

  if (!onboardingStatus) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-grayscale-600 text-base font-normal mb-6">{getDescription()}</h2>

      <div className="space-y-6 mb-6">
        {verificationSteps.map((step, index) => (
          <div key={step.id}>
            <div
              className={cn("flex items-center gap-3", !step.completed && "hover:cursor-pointer")}
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Image
                  src={step.icon || "/placeholder.svg"}
                  alt={step.title}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="text-left text-slate-1200 text-base font-normal flex-1">{step.title}</div>
              {step.completed && (
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/icons/check-filled.png"
                    alt={step.title}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
              )}
              {step.expired && (
                <div className="text-xs text-grayscale-600 bg-grayscale-500 rounded-sm px-4 py-1">
                  {t("kyc.unverified")}
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>
      {hasExpiredSteps ? (
      <Button className="w-full mt-6" onClick={handlePoiPoaExpiredLink}>{t("kyc.resubmitNow")}</Button>) : (
      <Button className="w-full mt-6" onClick={() => {}}>{t("profile.gettingStarted")}</Button>)
      }
    </div>
  )
}

export { KycOnboardingSheet }
export default KycOnboardingSheet
