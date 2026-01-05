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
    <Image
      onClick={handleClick}
      src="/icons/verified-badge.png"
      className="cursor-pointer"
      alt="Verified"
      width={32}
      height={32}
    />
  )
}
