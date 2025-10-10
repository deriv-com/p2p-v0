"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getHomeUrl } from "@/lib/utils"
import { getOnboardingStatus, type OnboardingStatusResponse } from "@/services/api/api-auth"

function KycOnboardingSheet() {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const status = await getOnboardingStatus()
        setOnboardingStatus(status)
      } catch (error) {
        console.error("Failed to fetch onboarding status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOnboardingStatus()
  }, [])

  const isProfileCompleted = (onboardingStatus?.p2p?.criteria?.find((c) => c.code === "deposit_enabled")?.passed && onboardingStatus?.p2p?.criteria?.find((c) => c.code === "withdraw_enabled")?.passed) || false
  const isPoiCompleted = onboardingStatus?.kyc?.poa_status === "approved"
  const isPoaCompleted = onboardingStatus?.p2p?.criteria?.find((c) => c.code === "poa")?.passed || false
  const isPhoneCompleted = onboardingStatus?.p2p?.criteria?.find((c) => c.code === "phone_verified")?.passed || false

  const verificationSteps = [
    {
      id: "profile",
      title: "Set up your profile",
      icon: "/icons/user-icon-black.png",
      completed: isProfileCompleted,
    },
    {
      id: "poi",
      title: "Proof of identity",
      icon: "/icons/account-profile.png",
      completed: isPoiCompleted,
    },
    {
      id: "poa",
      title: "Proof of address",
      icon: "/icons/home-icon.png",
      completed: isPoaCompleted,
    },
    {
      id: "phone",
      title: "Phone number",
      icon: "/icons/bell-sm.png",
      completed: isPhoneCompleted,
    },
  ]

  const handleStepClick = () => {
    window.location.href = `https://${getHomeUrl()}/dashboard/userprofile`
  }

  if (loading) {
    return null
  }

  return (
    <div className="w-full p-6 rounded-2xl md:rounded-none border md:border-none md:border-b border-gray-200">
      <h2 className="text-slate-1200 text-base font-normal mb-6">
        To access P2P, complete your profile and verification.
      </h2>

      <div className="space-y-0">
        {verificationSteps.map((step, index) => (
          <div key={step.id}>
            <div className="flex items-center gap-3 py-4 hover:cursor-pointer" onClick={handleStepClick}>
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Image
                  src={step.icon || "/placeholder.svg"}
                  alt={step.title}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="text-left text-slate-1200 text-base font-normal flex-1">{step.title}</div>
              {step.completed && (
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M13.3334 4L6.00002 11.3333L2.66669 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
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
