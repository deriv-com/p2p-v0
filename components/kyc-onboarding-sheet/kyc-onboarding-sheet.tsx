"use client"

import Image from "next/image"
import { getHomeUrl } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"

function KycOnboardingSheet() {
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)

  const isProfileCompleted =
    (onboardingStatus?.p2p?.criteria?.find((c) => c.code === "deposit_enabled")?.passed &&
      onboardingStatus?.p2p?.criteria?.find((c) => c.code === "withdraw_enabled")?.passed) ||
    false
  const isPoiCompleted = onboardingStatus?.kyc?.poa_status === "approved"
  const isPoaCompleted = onboardingStatus?.kyc?.poi_status === "approved"
  const isPhoneCompleted = onboardingStatus?.p2p?.criteria?.find((c) => c.code === "phone_verified")?.passed || false

  const verificationSteps = [
    {
      id: "profile",
      title: "Set up your profile",
      icon: "/icons/account-profile.png",
      completed: isProfileCompleted,
      link: `https://${getHomeUrl()}/dashboard/onboarding/personal-details`,
    },
    {
      id: "poi",
      title: "Proof of identity",
      icon: "/icons/poi.png",
      completed: isPoiCompleted,
      link: `https://${getHomeUrl()}/dashboard/onboarding/kyc-poi`,
    },
    {
      id: "poa",
      title: "Proof of address",
      icon: "/icons/poa.png",
      completed: isPoaCompleted,
      link: `https://${getHomeUrl()}/dashboard/onboarding/kyc-poa`,
    },
    {
      id: "phone",
      title: "Phone number",
      icon: "/icons/pnv.png",
      completed: isPhoneCompleted,
      link: `https://${getHomeUrl()}/dashboard/onboarding/personal-details`,
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
      <h2 className="text-slate-1200 text-base font-normal mb-6">
        To access P2P, complete your profile and verification.
      </h2>

      <div className="space-y-0">
        {verificationSteps.map((step, index) => (
          <div key={step.id}>
            <div
              className="flex items-center gap-3 py-6 hover:cursor-pointer"
              onClick={() => handleStepClick(step.link)}
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
