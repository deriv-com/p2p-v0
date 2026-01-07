"use client"

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"


export function ClosedGroupBadge() {
  const { t, locale } = useTranslations()

  return (
    <TooltipProvider>
      <Tooltip disableHoverableContent={false}>
        <TooltipTrigger asChild>
          <Image
            src="/icons/closed-group.svg"
            alt="Closed Group"
            width={20}
            height={20}
            className="cursor-pointer"
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[340px] text-wrap">
          <>
            <p className="font-bold text-white mb-2">{t(config.titleKey)}</p>
          </>
          <TooltipArrow className="fill-black" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
