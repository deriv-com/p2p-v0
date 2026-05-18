"use client"

import { Clock } from "lucide-react"
import { useId } from "react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/business-hours-codec"

export interface BusinessHoursTimeInputProps {
  label: string
  /** 24h `HH:mm`. */
  value: string | null
  onChange: (next: string) => void
  enabled?: boolean
  ariaLabel?: string
}

/**
 * Read-aloud time field with a hidden native `<input type="time">` overlaid
 * for tap-to-pick. Always stores 24h `HH:mm` for the backend; the visible
 * label is locale-formatted (`9:00 AM`).
 */
export function BusinessHoursTimeInput({
  label,
  value,
  onChange,
  enabled = true,
  ariaLabel,
}: BusinessHoursTimeInputProps) {
  const id = useId()
  const display = value ? formatTime(value) : ""

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className={cn(
          "text-xs",
          enabled ? "text-gray-500" : "text-gray-400",
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          "relative h-12 rounded-lg border bg-transparent",
          enabled ? "border-gray-300" : "border-gray-200",
        )}
      >
        <input
          id={id}
          type="time"
          step={60}
          value={value ?? ""}
          disabled={!enabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel ?? label}
          // Native picker handle — kept invisible but covering the field so
          // the user can tap anywhere on the surface to pick a time.
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div
          className={cn(
            "pointer-events-none flex items-center justify-between h-full px-3",
            enabled ? "text-gray-900" : "text-gray-400",
          )}
        >
          <span className="text-base">{display}</span>
          <Clock
            size={16}
            className={enabled ? "text-gray-500" : "text-gray-400"}
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}
