"use client"

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"


export function ClosedGroupBadge() {
  const { t } = useTranslations()

  return (
    <TooltipProvider>
      <Tooltip disableHoverableContent={false}>
        <TooltipTrigger asChild>
          <Image
            src="/icons/closed-group.svg"
            alt="Closed Group"
            width={32}
            height={32}
            className="cursor-pointer mr-1"
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[340px] text-wrap">
          <p className="text-white">This user is in your group list.</p>
          <TooltipArrow className="fill-black" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
