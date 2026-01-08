"use client"

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"

export default function VerifiedBadge() {
  const { t } = useTranslations()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Image
            src="/icons/verified-badge.png"
            className="cursor-pointer"
            alt="Verified"
            width={32}
            height={32}
          />
        </TooltipTrigger>
        <TooltipContent align="start" className="max-w-[340px] text-wrap">
            <p className="font-bold text-white mb-2">{t("common.verifiedBadge.title")}</p>
            <p className="text-white">{t("common.verifiedBadge.description")}</p>
          <TooltipArrow className="fill-black" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
