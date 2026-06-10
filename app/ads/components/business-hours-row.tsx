"use client"

import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useUserDataStore } from "@/stores/user-data-store"
import {
  type BusinessHoursLiveStatus,
  computeLiveStatus,
  decodeSchedule,
  formatTime,
} from "@/lib/business-hours-codec"
import { getCurrentTimezone } from "@/lib/timezone"
import { cn } from "@/lib/utils"

export interface BusinessHoursRowProps {
  onClick: () => void
  className?: string
}

/**
 * Compact summary line rendered inside the dark My Ads header.
 *
 * Shows live status based on the device clock:
 * - `Business hour: Always open` + green (no schedule restriction)
 * - `Business hour: 9:00 AM – 5:00 PM` + green (currently inside the window)
 * - `Business hour: Offline` + gray (today not selected or outside window)
 *
 * Re-evaluates every minute via a timer so the row flips automatically when
 * the user crosses an open/close boundary.
 */
export function BusinessHoursRow({ onClick, className }: BusinessHoursRowProps) {
  const { t, locale } = useTranslations()
  const schedule = useUserDataStore((s) => s.userData?.schedule)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const state = decodeSchedule(schedule ?? null, getCurrentTimezone())
  const status = computeLiveStatus(state, new Date())
  const summary = summaryFor(status, state.openTime, state.closeTime, locale, {
    alwaysOpen: t("myAds.businessHours.alwaysOpen"),
    offline: t("myAds.businessHours.offlineSubtitle"),
  })
  const isOpen = status !== "offline"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="business-hours"
      className={cn(
        "flex items-center gap-2 text-white text-sm font-normal",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-2 w-2 rounded-full shrink-0",
          isOpen ? "bg-emerald-500" : "bg-gray-400",
        )}
      />
      <span className="truncate">
        {t("myAds.businessHours.headerLabel", { summary })}
      </span>
      <ChevronRight size={14} aria-hidden className="shrink-0" />
    </button>
  )
}

function summaryFor(
  status: BusinessHoursLiveStatus,
  openTime: string | null,
  closeTime: string | null,
  locale: string | undefined,
  copy: { alwaysOpen: string; offline: string },
): string {
  switch (status) {
    case "alwaysOpen":
      return copy.alwaysOpen
    case "openNow":
      return `${formatTime(openTime, locale)} – ${formatTime(closeTime, locale)}`
    case "offline":
      return copy.offline
  }
}
