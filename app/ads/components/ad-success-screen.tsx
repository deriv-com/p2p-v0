"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { Ad } from "@/types"

interface AdSuccessScreenProps {
  ad: Ad
  onShareClick: () => void
}

export default function AdSuccessScreen({ ad, onShareClick }: AdSuccessScreenProps) {
  const router = useRouter()
  const { t } = useTranslations()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#3a2f4a] via-[#2a1f3a] to-[#1a0f2a]">
      <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6">
        {/* Success Icon with Animation */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/20"></div>
          <div className="relative flex items-center justify-center">
            {/* Ad Document Icon */}
            <svg width="200" height="200" viewBox="0 0 200 200" className="w-40 h-40 md:w-56 md:h-56">
              {/* Document */}
              <rect x="50" y="30" width="120" height="140" rx="8" fill="#e8e8e8" stroke="#999" strokeWidth="1" />
              
              {/* Document fold */}
              <path d="M 170 30 L 170 50 L 150 50" fill="#f5f5f5" stroke="#999" strokeWidth="0.5" />
              
              {/* Document lines */}
              <rect x="65" y="50" width="80" height="3" rx="1.5" fill="#ff6b6b" />
              <rect x="65" y="70" width="80" height="2" rx="1" fill="#ddd" />
              <rect x="65" y="82" width="80" height="2" rx="1" fill="#ddd" />
              <rect x="65" y="94" width="80" height="2" rx="1" fill="#ddd" />
              <rect x="65" y="106" width="50" height="2" rx="1" fill="#ddd" />
              
              {/* "Ad" text */}
              <text x="65" y="65" fontSize="16" fontWeight="bold" fill="#ff6b6b">Ad</text>
              
              {/* Checkmark circle */}
              <circle cx="135" cy="120" r="35" fill="#ff6b6b" />
              
              {/* Checkmark */}
              <path
                d="M 120 120 L 130 133 L 150 110"
                stroke="white"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t("myAds.adCreated")}
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-8">
            {t("adForm.adCreatedSuccess", { type: ad.type })}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs md:max-w-sm mt-8">
          <Button
            onClick={onShareClick}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-full text-lg transition-colors"
          >
            {t("shareAdPage.shareImage")}
          </Button>
          <Button
            onClick={() => router.push("/ads")}
            variant="outline"
            className="w-full border-gray-400 text-white hover:bg-white/10 font-semibold py-6 rounded-full text-lg transition-colors"
          >
            {t("myAds.goToMyAds")}
          </Button>
        </div>
      </div>
    </div>
  )
}
