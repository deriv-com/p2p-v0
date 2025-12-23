"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn, getHomeUrl } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { useTranslations } from "@/lib/i18n/use-translations"

function KycOnboardingSheet() {
  const { t } = useTranslations()
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const userId = useUserDataStore((state) => state.userId)

  const isProfileCompleted =
    (onboardingStatus?.p2p?.criteria?.find((c) => c.code === "deposit_enabled")?.passed &&
      onboardingStatus?.p2p?.criteria?.find((c) => c.code === "withdraw_enabled")?.passed) ||
    false
  const isPoiCompleted = onboardingStatus?.kyc?.poi_status === "approved"
  const isPoaCompleted = onboardingStatus?.kyc?.poa_status === "approved"
  const isPoiExpired = userId && !isPoiCompleted
  const isPoaExpired = userId && !isPoaCompleted
  const isPhoneCompleted = onboardingStatus?.p2p?.criteria?.find((c) => c.code === "phone_verified")?.passed || false

  const allVerificationSteps = [
    {
      id: "profile",
      title: t("kyc.setupProfile"),
      icon: "/icons/account-profile.png",
      completed: isProfileCompleted,
      link: `https://${getHomeUrl()}/dashboard/onboarding/personal-details?is_from_p2p=true`,
    },
    {
      id: "poi",
      title: t("kyc.proofOfIdentity"),
      icon: "/icons/poi.png",
      completed: isPoiCompleted,
      expired: isPoiExpired,
      link: `https://${getHomeUrl()}/dashboard/kyc/confirm-detail?is_from_p2p=true`,
    },
    {
      id: "poa",
      title: t("kyc.proofOfAddress"),
      icon: "/icons/poa.png",
      completed: isPoaCompleted,
      expired: isPoaExpired,
      link: `https://${getHomeUrl()}/dashboard/kyc/address?is_from_p2p=true`,
    },
    {
      id: "phone",
      title: t("kyc.phoneNumber"),
      icon: "/icons/pnv.png",
      completed: isPhoneCompleted,
      link: `https://${getHomeUrl()}/dashboard/details?is_from_p2p=true`,
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
      if(isPoiExpired && isPoaExpired) return "Resubmit your proof of identity and address to continue using P2P."
      else if(isPoiExpired) return "Resubmit your proof of identity to continue using P2P."
      else if(isPoaExpired) return "Resubmit your proof of address to continue using P2P."
    } 

    return t("kyc.accessP2PMessage")
  }
  const handleStepClick = (link) => {
    window.location.href = link
  }
  const handlePoiPoaExpiredLink = () => {
    if(isPoiExpired) window.location.href = `https://${getHomeUrl()}/dashboard/kyc/confirm-detail?is_from_p2p=true`
    else window.location.href = `https://${getHomeUrl()}/dashboard/kyc/address?is_from_p2p=true`
  }

  if (!onboardingStatus) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-grayscale-600 text-base font-normal mb-6">{getDescription()}</h2>

      <div className="space-y-6">
        {verificationSteps.map((step, index) => (
          <div key={step.id}>
            <div
              className={cn("flex items-center gap-3", !step.completed && "hover:cursor-pointer")}
              onClick={() => {
                if (!step.completed) handleStepClick(step.link)
              }}
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
                  Unverified
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasExpiredSteps && <Button className="w-full mt-6" onClick={handlePoiPoaExpiredLink}>Resubmit now</Button>}
    </div>
  )
}

export { KycOnboardingSheet }
export default KycOnboardingSheet
