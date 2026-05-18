"use client"

import { ChevronRight } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useUserDataStore } from "@/stores/user-data-store"
import { decodeSchedule, summaryFor } from "@/lib/business-hours-codec"
import { getCurrentTimezone } from "@/lib/timezone"
import { cn } from "@/lib/utils"

export interface BusinessHoursRowProps {
  onClick: () => void
  className?: string
}

/**
 * Compact summary line rendered inside the dark My Ads header.
 * Format: `● Business hour: Always open ›`. Green dot when "open"
 * (always-open OR ≥1 selected day), red dot when "Closed".
 */
export function BusinessHoursRow({ onClick, className }: BusinessHoursRowProps) {
  const { t, locale } = useTranslations()
  const schedule = useUserDataStore((s) => s.userData?.schedule)
  const state = decodeSchedule(schedule ?? null, getCurrentTimezone())
  const summary = summaryFor(
    state,
    {
      alwaysOpen: t("myAds.businessHours.alwaysOpen"),
      closed: t("myAds.businessHours.closedSubtitle"),
    },
    locale,
  )
  const isOpen = !state.enabled || state.selectedDays.size > 0

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
          isOpen ? "bg-emerald-500" : "bg-red-500",
        )}
      />
      <span className="truncate">
        {t("myAds.businessHours.headerLabel", { summary })}
      </span>
      <ChevronRight size={14} aria-hidden className="shrink-0" />
    </button>
  )
}
