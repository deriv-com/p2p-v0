"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { Ad } from "@/types"

interface AdSuccessScreenProps {
  ad: Ad
  onShare: () => void
}

export default function AdSuccessScreen({ ad, onShare }: AdSuccessScreenProps) {
  const { t } = useTranslations()

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full flex flex-col items-center justify-center gap-8">
        {/* Success Illustration */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/My_ads_page-Lf9Iq7KB4lP7WAV1RGgFXuPdyTycBh.png"
            alt="Ad created successfully"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Success Content */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("adForm.adCreatedSuccess", { type: ad.type })}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {t("adForm.adCreatedDescription") || "Your ad has been created successfully"}
          </p>
        </div>

        {/* Share Button */}
        <Button
          onClick={onShare}
          className="w-full md:w-80 rounded-full h-12 bg-[#ff444f] hover:bg-[#e63a43] text-white font-semibold text-base"
        >
          {t("shareAdPage.shareAd")}
        </Button>
      </div>
    </div>
  )
}
