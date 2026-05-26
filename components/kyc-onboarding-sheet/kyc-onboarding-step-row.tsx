import Image from "next/image"
import { cn } from "@/lib/utils"
import type { OnboardingKycStepStatus } from "@/lib/kyc/onboarding-kyc-step-status"
import { onboardingKycStepStatusIsDisplayable } from "@/lib/kyc/onboarding-kyc-step-status"
import { KycStatusBadge } from "./kyc-status-badge"

export interface KycOnboardingStep {
  id: string
  title: string
  icon: string
  completed: boolean
  link?: string
  rejected?: boolean
  inReview?: boolean
  expired?: boolean | "" | 0
  status?: OnboardingKycStepStatus
}

interface KycOnboardingStepRowProps {
  step: KycOnboardingStep
  statusLabels: {
    verified: string
    inReview: string
    failed: string
    unverified: string
  }
}

export function KycOnboardingStepRow({ step, statusLabels }: KycOnboardingStepRowProps) {
  const showProfileCheck = step.completed && step.id === "profile"
  const displayStatus = step.status ?? "none"
  const showStatusBadge =
    step.id !== "profile" &&
    (onboardingKycStepStatusIsDisplayable(displayStatus) || Boolean(step.expired))

  return (
    <div className={cn("flex items-center gap-3")}>
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
        <Image
          src={step.icon || "/placeholder.svg"}
          alt=""
          aria-hidden
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
      <div className="flex-1 text-left text-base font-normal text-slate-1200">{step.title}</div>
      {showProfileCheck && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <Image
            src="/icons/tick.svg"
            alt=""
            aria-hidden
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
      )}
      {showStatusBadge && (
        <KycStatusBadge
          status={step.expired ? "expired" : displayStatus}
          labels={statusLabels}
          showUnverified={Boolean(step.expired)}
        />
      )}
    </div>
  )
}
