"use client"

import { useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface AdVisibilitySelectorProps {
  value: number
  onValueChange: (value: number) => void
}

export default function AdVisibilitySelector({ value, onValueChange }: AdVisibilitySelectorProps) {
  const { t } = useTranslations()

  return (
    <div className="space-y-3">
    <Button
      type="button"
      onClick={() => setAdVisibility("everyone")}
      className={cn(
        "w-full p-4 rounded-lg border-2 transition-all text-left",
        adVisibility === "everyone"
          ? "border-black bg-white"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Image
            src="/globe-icon.png"
            alt="Everyone"
            width={24}
            height={24}
          />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold mb-1">{t("adForm.everyone")}</h4>
          <p className="text-sm text-gray-600">{t("adForm.everyoneDescription")}</p>
        </div>
      </div>
    </Button>
    <button
      type="button"
      onClick={() => setAdVisibility("closed_group")}
      className={cn(
        "w-full p-4 rounded-lg border-2 transition-all text-left",
        adVisibility === "closed_group"
          ? "border-black bg-white"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Image
            src="/icons/star-custom.png"
            alt="Closed group"
            width={24}
            height={24}
          />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold mb-1">{t("adForm.closedGroup")}</h4>
          <p className="text-sm text-gray-600">
            {t("adForm.closedGroupDescription")}{" "}
            <span className="text-blue-600 underline">{t("adForm.editList")}</span>
          </p>
        </div>
      </div>
    </button>
  </div>
  )
}
