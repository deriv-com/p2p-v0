"use client"

import { Clock } from "lucide-react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/business-hours-codec"
import { TimePicker } from "./business-hours-time-picker"

export type BusinessHoursTimeRange = "am" | "pm"

export interface BusinessHoursTimeInputProps {
  label: string
  /** 24h `HH:mm`. */
  value: string | null
  onChange: (next: string) => void
  range: BusinessHoursTimeRange
  enabled?: boolean
  hasError?: boolean
  ariaLabel?: string
}

export function BusinessHoursTimeInput({
  label,
  value,
  onChange,
  enabled = true,
  hasError = false,
  ariaLabel,
}: BusinessHoursTimeInputProps) {
  const [open, setOpen] = useState(false)
  const display = value ? formatTime(value) : ""

  return (
    <div className="flex flex-col gap-1">
      <label className={cn("text-xs", enabled ? "text-gray-500" : "text-gray-400")}>
        {label}
      </label>
      <Popover open={open} onOpenChange={(v) => enabled && setOpen(v)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={!enabled}
            aria-label={ariaLabel ?? label}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-lg border bg-transparent px-3",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
              !enabled && "cursor-not-allowed border-gray-200 text-gray-400",
              enabled && hasError && "border-red-500 bg-red-50 text-red-600",
              enabled && !hasError && "border-gray-300 text-gray-900",
            )}
          >
            <span className="text-base">{display}</span>
            <Clock
              size={16}
              aria-hidden
              className={!enabled ? "text-gray-400" : hasError ? "text-red-500" : "text-gray-400"}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-52 p-3 rounded-2xl shadow-xl border border-gray-100 bg-white overflow-hidden"
        >
          <TimePicker value={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
