"use client"

import { Clock } from "lucide-react"
import { useId, useRef } from "react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/business-hours-codec"

export type BusinessHoursTimeRange = "am" | "pm"

export interface BusinessHoursTimeInputProps {
  label: string
  /** 24h `HH:mm`. */
  value: string | null
  onChange: (next: string) => void
  /**
   * Used only to seed the picker when the field is empty (9 AM for `am`,
   * 10 PM for `pm`). The actual AM/PM constraint is enforced by the inline
   * error + Save button being disabled when invalid — the native picker
   * itself is not restricted.
   */
  range: BusinessHoursTimeRange
  enabled?: boolean
  hasError?: boolean
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
  hasError = false,
  ariaLabel,
}: BusinessHoursTimeInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const display = value ? formatTime(value) : ""

  const handleWrapperClick = () => {
    if (!enabled) return
    // showPicker() opens the native time picker on desktop browsers (Chrome 99+,
    // Safari 16+, Firefox 101+). On mobile the input already opens on tap.
    try {
      inputRef.current?.showPicker()
    } catch {
      inputRef.current?.focus()
    }
  }

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
        role="button"
        tabIndex={enabled ? 0 : -1}
        aria-label={ariaLabel ?? label}
        onClick={handleWrapperClick}
        onKeyDown={(e) => e.key === "Enter" || e.key === " " ? handleWrapperClick() : undefined}
        className={cn(
          "relative h-12 rounded-lg border bg-transparent cursor-pointer",
          !enabled && "border-gray-200 cursor-not-allowed",
          enabled && hasError && "border-red-500 bg-red-50",
          enabled && !hasError && "border-gray-300",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="time"
          step={60}
          value={value ?? ""}
          disabled={!enabled}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
        <div
          className={cn(
            "pointer-events-none flex items-center justify-between h-full px-3",
            !enabled && "text-gray-400",
            enabled && hasError && "text-red-600",
            enabled && !hasError && "text-gray-900",
          )}
        >
          <span className="text-base">{display}</span>
          <Clock
            size={16}
            className={
              !enabled
                ? "text-gray-400"
                : hasError
                ? "text-red-600"
                : "text-gray-500"
            }
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}
