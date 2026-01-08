"use client"

import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useTranslations } from "@/lib/i18n/use-translations"

interface VerifiedBadgeProps {
  isCurrentUser?: boolean
}

export default function VerifiedBadge({ isCurrentUser = false }: VerifiedBadgeProps) {
  const { showAlert } = useAlertDialog()
  const { t } = useTranslations()

  const handleClick = () => {
    showAlert({
      title: t("common.verifiedBadge.title"),
      description: isCurrentUser
        ? t("common.verifiedBadge.descriptionSelf")
        : t("common.verifiedBadge.descriptionOther"),
      confirmText: "OK",
      type: "info",
    })
  }

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
          <>
            <p className="font-bold text-white mb-2">{t(config.titleKey)}</p>
            <p className="text-white">{t(config.descriptionKey)}</p>
          </>
          <TooltipArrow className="fill-black" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
