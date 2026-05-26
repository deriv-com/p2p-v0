import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
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
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col bg-background md:w-1/2",
        "flex justify-center px-6 pb-6 pt-6",
        "md:justify-start md:self-stretch md:px-12 md:pb-[7%] md:pt-[13%]",
      )}
    >
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

      <div className="flex min-h-0 flex-1 flex-col justify-between">
        {/* Top: title, description, checklist */}
        <div>
          <h2 className="text-base font-semibold text-slate-1200 md:text-2xl md:font-bold md:leading-8">
            {title}
          </h2>
          <p className="mt-2 text-base font-normal text-grayscale-600 md:mt-3 md:text-lg md:leading-7">
            {description}
          </p>
          <div className="mt-6 md:mt-8">
            <KycOnboardingChecklist steps={steps} statusLabels={statusLabels} />
          </div>
        </div>

        {/* Bottom: CTA pinned to bottom */}
        <Button
          className="mt-6 w-full shrink-0 md:mt-0 md:h-12 md:rounded-full"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  )
}
