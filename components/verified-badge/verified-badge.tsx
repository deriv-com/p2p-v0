"use client"

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"

interface VerifiedBadgeProps {
  isCurrentUser?: boolean
}

export default function VerifiedBadge({ isCurrentUser = false }: VerifiedBadgeProps) {
  const { t } = useTranslations()

  return (
    <TooltipProvider>
      <Tooltip disableHoverableContent={false}>
        <TooltipTrigger asChild>
          <Image
            src="/icons/verified-badge.png"
            className="cursor-pointer"
            alt="Verified"
            width={32}
            height={32}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[340px] text-wrap">
            <p className="font-bold text-white mb-2">{t("common.verifiedBadge.title")}</p>
            <p className="text-white">{isCurrentUser
        ? t("common.verifiedBadge.descriptionSelf")
        : t("common.verifiedBadge.descriptionOther")}</p>
          <TooltipArrow className="fill-black" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
