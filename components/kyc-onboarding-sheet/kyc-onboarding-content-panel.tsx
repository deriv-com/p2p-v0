import { Button } from "@/components/ui/button"
import Image from "next/image"
import { KycOnboardingChecklist } from "./kyc-onboarding-checklist"
import type { KycOnboardingStep } from "./kyc-onboarding-step-row"

interface KycOnboardingContentPanelProps {
  title: string
  description: string
  steps: KycOnboardingStep[]
  buttonLabel: string
  onButtonClick: () => void
  onClose?: () => void
  statusLabels: {
    verified: string
    inReview: string
    failed: string
    unverified: string
  }
}

export function KycOnboardingContentPanel({
  title,
  description,
  steps,
  buttonLabel,
  onButtonClick,
  onClose,
  statusLabels,
}: KycOnboardingContentPanelProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute right-4 top-4 hidden min-w-[48px] bg-slate-75 px-1 md:inline-flex md:right-6 md:top-6"
          aria-label="Close"
        >
          <Image src="/icons/close-icon.png" alt="" width={24} height={24} />
        </Button>
      )}

      <div className="md:pr-10">
        <h2 className="text-base font-semibold text-slate-1200">{title}</h2>
        <p className="mt-2 text-base font-normal text-grayscale-600">{description}</p>

        <div className="mt-6">
          <KycOnboardingChecklist steps={steps} statusLabels={statusLabels} />
        </div>

        <Button className="mt-6 w-full" onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  )
}
