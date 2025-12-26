"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn, getHomeUrl } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { useTranslations } from "@/lib/i18n/use-translations"

function KycOnboardingSheet() {
  const { t } = useTranslations()
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)

  const isProfileCompleted =
    (onboardingStatus?.p2p?.criteria?.find((c) => c.code === "deposit_enabled")?.passed &&
      onboardingStatus?.p2p?.criteria?.find((c) => c.code === "withdraw_enabled")?.passed) ||
    false
  const isPoiCompleted = onboardingStatus?.kyc?.poi_status === "approved"
  const isPoaCompleted = onboardingStatus?.kyc?.poa_status === "approved"
  const isPhoneCompleted = onboardingStatus?.p2p?.criteria?.find((c) => c.code === "phone_verified")?.passed || false

  const verificationSteps = [
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
      link: `https://${getHomeUrl()}/dashboard/kyc/confirm-detail?is_from_p2p=true`,
    },
    {
      id: "poa",
      title: t("kyc.proofOfAddress"),
      icon: "/icons/poa.png",
      completed: isPoaCompleted,
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

  const handleStepClick = (link) => {
    window.location.href = link
  }

  if (!onboardingStatus) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-slate-1200 text-base font-normal mb-6">{t("kyc.accessP2PMessage")}</h2>

      <div className="space-y-0">
        {verificationSteps.map((step, index) => (
          <div key={step.id}>
            <div
              className={cn("flex items-center gap-3 py-6", !step.completed && "hover:cursor-pointer")}
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
            </div>
            {index < verificationSteps.length - 1 && <div className="border-b border-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export { KycOnboardingSheet }
export default KycOnboardingSheet
