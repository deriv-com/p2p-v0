import Image from "next/image"
import { cn } from "@/lib/utils"
import { KycOnboardingGradient } from "./kyc-onboarding-gradient"

interface KycOnboardingVisualPanelProps {
  variant: "desktop" | "mobile"
  logoAlt: string
  headline: string
  benefits: [string, string, string, string]
  showDragHandle?: boolean
}

function BenefitChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded border border-white/15 px-1 py-0.5">
      <Image src="/icons/tick.svg" alt="" aria-hidden width={10} height={10} className="h-2.5 w-2.5" />
      <span className="text-[10px] font-semibold leading-none text-white">{label}</span>
    </div>
  )
}

export function KycOnboardingVisualPanel({
  variant,
  logoAlt,
  headline,
  benefits,
  showDragHandle = false,
}: KycOnboardingVisualPanelProps) {
  const isDesktop = variant === "desktop"
  const screenSrc = isDesktop
    ? "/images/onboarding/desktop_screen.svg"
    : "/images/onboarding/mobile_screen.svg"

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-slate-1200",
        isDesktop ? "hidden min-h-[600px] w-[440px] md:flex" : "flex h-[220px] w-full md:hidden",
      )}
    >
      <KycOnboardingGradient variant={variant} />

      {showDragHandle && (
        <div className="absolute left-0 right-0 top-2 z-10 flex justify-center">
          <div className="mt-2 h-0.5 w-12 rounded-full bg-white/40" />
        </div>
      )}

      <div
        className={cn(
          "absolute z-[1]",
          isDesktop ? "bottom-8 left-8 w-[300px]" : "left-6 top-8 w-[88px]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenSrc} alt="" aria-hidden className="h-auto w-full object-contain" />
      </div>

      <div
        className={cn(
          "absolute z-[2] flex flex-col items-start",
          isDesktop ? "bottom-12 left-[220px] right-8" : "bottom-4 left-[144px] right-6 top-[88px]",
        )}
      >
        <Image
          src="/icons/p2p-logo-white.svg"
          alt={logoAlt}
          width={120}
          height={14}
          className="h-[14px] w-auto"
        />
        <p className="mt-2 text-base font-semibold leading-snug text-white">{headline}</p>
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex flex-wrap gap-1">
            <BenefitChip label={benefits[0]} />
            <BenefitChip label={benefits[1]} />
          </div>
          <div className="flex flex-wrap gap-1">
            <BenefitChip label={benefits[2]} />
            <BenefitChip label={benefits[3]} />
          </div>
        </div>
      </div>
    </div>
  )
}
