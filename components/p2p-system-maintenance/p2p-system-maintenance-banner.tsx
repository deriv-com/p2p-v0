"use client"

import Image from "next/image"
import { Alert } from "@/components/ui/alert"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useP2PSystemMaintenance } from "@/hooks/use-p2p-system-maintenance"
import { cn } from "@/lib/utils"

interface P2PSystemMaintenanceBannerProps {
  /** When true, uses dim warning overlay + white text for dark headers. */
  embeddedInDarkHeader?: boolean
}

function openLiveChat(): void {
  window.Intercom?.("show")
}

export function P2PSystemMaintenanceBanner({
  embeddedInDarkHeader = false,
}: P2PSystemMaintenanceBannerProps) {
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
      className={cn(
        "flex flex-col gap-3 rounded-none border-transparent px-4 pt-4 pb-4",
        embeddedInDarkHeader
          ? "bg-[#2d1820]/60 text-white md:rounded-none md:bg-[#2d1820]/60"
          : "bg-error-light text-grayscale-100 md:rounded-2xl md:px-6 md:pt-6 md:pb-6",
      )}
    >
      <div className="flex items-start gap-3">
        <Image
          src="/icons/warning-triangle-red.svg"
          alt=""
          height={32}
          width={32}
          className="flex-shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-sm font-bold leading-tight">{title}</div>
          <p
            className={cn(
              "text-sm leading-snug",
              embeddedInDarkHeader ? "text-white/70" : "text-grayscale-600",
            )}
          >
            {prefix}
            <button
              type="button"
              onClick={openLiveChat}
              className={cn(
                "font-bold underline underline-offset-2",
                embeddedInDarkHeader ? "text-white" : "text-grayscale-100",
              )}
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
