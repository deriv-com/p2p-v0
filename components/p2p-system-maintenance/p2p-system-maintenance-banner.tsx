"use client"

import Image from "next/image"
import { Alert } from "@/components/ui/alert"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useP2PSystemMaintenance } from "@/hooks/use-p2p-system-maintenance"

function openLiveChat(): void {
  window.Intercom?.("show")
}

export function P2PSystemMaintenanceBanner() {
  const { t } = useTranslations()
  const { isActive } = useP2PSystemMaintenance()

  if (!isActive) return null

  const title = t("maintenance.title")
  const prefix = t("maintenance.descriptionPrefix")
  const linkLabel = t("maintenance.liveChatLink")
  const suffix = t("maintenance.descriptionSuffix")

  return (
    <Alert
      role="alert"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-none border-transparent bg-warning-bg px-4 pt-4 pb-4 text-grayscale-100 md:flex-row md:items-center md:gap-4 md:rounded-2xl md:px-6 md:pt-6 md:pb-12"
    >
      <div className="flex items-start gap-3 md:flex-1 md:items-center md:gap-4">
        <Image
          src="/icons/ad-warning.svg"
          alt=""
          height={24}
          width={24}
          className="flex-shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-sm font-bold leading-tight">{title}</div>
          <p className="text-sm leading-snug text-grayscale-600">
            {prefix}
            <button
              type="button"
              onClick={openLiveChat}
              className="font-bold text-grayscale-100 underline underline-offset-2"
              aria-label={linkLabel}
            >
              {linkLabel}
            </button>
            {suffix}
          </p>
        </div>
      </div>
    </Alert>
  )
}
