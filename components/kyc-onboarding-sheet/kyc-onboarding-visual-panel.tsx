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

function BenefitChip({ label, size }: { label: string; size: "desktop" | "mobile" }) {
  const isDesktop = size === "desktop"

  return (
    <div
      className={cn(
        "inline-flex items-center rounded border border-white/15",
        isDesktop ? "gap-1.5 px-2 py-1" : "gap-1 px-1 py-0.5",
      )}
    >
      <Image
        src="/icons/tick.svg"
        alt=""
        aria-hidden
        width={isDesktop ? 12 : 10}
        height={isDesktop ? 12 : 10}
        className={isDesktop ? "h-3 w-3" : "h-2.5 w-2.5"}
      />
      <span
        className={cn(
          "font-semibold leading-none text-white",
          isDesktop ? "text-xs" : "text-[10px]",
        )}
      >
        {label}
      </span>
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
        "relative overflow-hidden bg-slate-1200",
        isDesktop ? "hidden h-[600px] md:flex md:w-1/2 md:shrink-0" : "flex h-[220px] w-full shrink-0 md:hidden",
      )}
    >
      <KycOnboardingGradient variant={variant} />

      {showDragHandle && (
        <div className="absolute left-0 right-0 top-2 z-10 flex justify-center">
          <div className="mt-2 h-0.5 w-12 rounded-full bg-white/40" />
        </div>
      )}

      {isDesktop ? (
        <>
          {/* Logo, headline, chips — top-left, above the screen mockup */}
          <div className="absolute left-6 right-6 top-6 z-[2] flex flex-col items-start">
            <Image
              src="/images/onboarding/deriv-p2p-logo.svg"
              alt={logoAlt}
              width={96}
              height={18}
              className="h-[18px] w-auto"
            />
            <p className="mt-8 max-w-[320px] text-2xl font-semibold leading-snug text-white">
              {headline}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <BenefitChip label={benefits[0]} size="desktop" />
                <BenefitChip label={benefits[1]} size="desktop" />
              </div>
              <div className="flex flex-wrap gap-2">
                <BenefitChip label={benefits[2]} size="desktop" />
                <BenefitChip label={benefits[3]} size="desktop" />
              </div>
            </div>
          </div>

          {/* Desktop mockup — bottom-left, does not overlap hero copy */}
          <div className="absolute bottom-6 left-6 z-[1] w-[384px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenSrc} alt="" aria-hidden className="h-auto w-full object-contain" />
          </div>
        </>
      ) : (
        <>
          <div className="absolute left-6 top-8 z-[1] w-[88px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenSrc} alt="" aria-hidden className="h-auto w-full object-contain" />
          </div>

          <div className="absolute bottom-4 left-[144px] right-6 top-[88px] z-[2] flex flex-col items-start">
            <Image
              src="/images/onboarding/deriv-p2p-logo.svg"
              alt={logoAlt}
              width={120}
              height={14}
              className="h-[14px] w-auto"
            />
            <p className="mt-2 text-sm font-semibold leading-snug text-white">{headline}</p>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex flex-wrap gap-1">
                <BenefitChip label={benefits[0]} size="mobile" />
                <BenefitChip label={benefits[1]} size="mobile" />
              </div>
              <div className="flex flex-wrap gap-1">
                <BenefitChip label={benefits[2]} size="mobile" />
                <BenefitChip label={benefits[3]} size="mobile" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
