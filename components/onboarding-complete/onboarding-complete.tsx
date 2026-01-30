"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/i18n/use-translations"

interface OnboardingCompleteProps {
  onClose?: () => void
}

export function OnboardingComplete({ onClose }: OnboardingCompleteProps) {
  const router = useRouter()
  const { t } = useTranslations()

  const handleGoToMarket = () => {
    onClose?.()
    router.push("/")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-12">
      {/* User Avatar Illustration with Checkmark */}
      <div className="relative mb-12 w-48 h-48">
        {/* Avatar Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg
              className="w-16 h-16 text-slate-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        {/* Checkmark Badge */}
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-red-500 rounded-full shadow-xl flex items-center justify-center border-4 border-slate-800">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="text-center mb-12 max-w-md">
        <h1 className="text-4xl font-bold text-white mb-4">
          {t("onboarding.youreAllSet") || "You're all set"}
        </h1>
        <p className="text-lg text-slate-300">
          {t("onboarding.exploreMarket") ||
            "Explore the market to buy and sell currencies directly with other traders."}
        </p>
      </div>

      {/* CTA Button */}
      <Button
        onClick={handleGoToMarket}
        className="w-full max-w-xs h-14 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {t("onboarding.goToMarket") || "Go to Market"}
      </Button>
    </div>
  )
}
