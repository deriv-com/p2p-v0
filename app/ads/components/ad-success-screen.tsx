"use client"

import Image from "next/image"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          "radial-gradient(108.21% 50% at 52.05% 0%, rgba(255, 68, 79, 0.24) 0%, rgba(255, 68, 79, 0.00) 100%), #181C25",
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6">
        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Image
              src="/icons/ad-posted.png"
              alt="Ad created"
              width={256}
              height={256}
              className="w-40 h-40 md:w-56 md:h-56"
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extrabold text-white mb-3">
            {t("myAds.adCreated")}
          </h1>
          <p className="text-gray-300 text-base mb-8 opacity-72">
            {t("adForm.adCreatedSuccess", { type: ad.type })}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs md:max-w-sm mt-8">
          <Button
            onClick={onShareClick}
            className="w-full rounded-full transition-colors"
          >
            {t("shareAdPage.shareImage")}
          </Button>
          <Button
            onClick={() => router.push("/ads")}
            variant="outline"
            className="w-full rounded-full transition-colors"
          >
            {t("myAds.goToMyAds")}
          </Button>
        </div>
      </div>
    </div>
  )
}
