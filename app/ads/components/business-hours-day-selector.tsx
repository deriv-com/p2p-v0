"use client"

import { cn } from "@/lib/utils"
import type { DayKey } from "@/lib/business-hours-codec"

const DAY_RENDER_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

export interface BusinessHoursDaySelectorProps {
  selectedDays: Set<DayKey>
  /** Map of day key (`mon`..`sun`) to single-letter localized label (`M`, `T`, ...). */
  dayLabels: Record<DayKey, string>
  onToggle: (day: DayKey) => void
  enabled?: boolean
}

export function BusinessHoursDaySelector({
  selectedDays,
  dayLabels,
  onToggle,
  enabled = true,
}: BusinessHoursDaySelectorProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {DAY_RENDER_ORDER.map((key) => {
        const selected = selectedDays.has(key)
        return (
          <button
            key={key}
            type="button"
            role="button"
            aria-pressed={selected}
            aria-label={`day-${key}`}
            disabled={!enabled}
            onClick={() => onToggle(key)}
            className={cn(
              "h-9 rounded-lg border bg-transparent text-sm transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-700",
              !enabled &&
                "border-gray-300 text-gray-400 cursor-not-allowed",
              enabled && selected &&
                "border-[1.5px] border-gray-900 bg-gray-100 text-gray-900 font-bold",
              enabled && !selected &&
                "border-gray-300 text-gray-900 hover:bg-gray-50",
            )}
          >
            {dayLabels[key]}
          </button>
        )
      })}
    </div>
  )
}
