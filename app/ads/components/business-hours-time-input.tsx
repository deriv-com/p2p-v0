"use client"

import { Clock } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/business-hours-codec"

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

/** 30-min increments for the full 24h day. */
const ALL_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = (i % 2) * 30
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
})

export function BusinessHoursTimeInput({
  label,
  value,
  onChange,
  enabled = true,
  hasError = false,
  ariaLabel,
}: BusinessHoursTimeInputProps) {
  const [open, setOpen] = useState(false)
  const selectedRef = useRef<HTMLButtonElement>(null)
  const display = value ? formatTime(value) : ""

  // Scroll selected item into view when popover opens.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        selectedRef.current?.scrollIntoView({ block: "center" })
      })
    }
  }, [open])

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
              className={
                !enabled ? "text-gray-400" : hasError ? "text-red-500" : "text-gray-400"
              }
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-40 p-0 overflow-hidden rounded-xl shadow-lg border border-gray-200"
        >
          <div className="h-56 overflow-y-auto overscroll-contain py-2">
            {ALL_OPTIONS.map((opt) => {
              const isSelected = opt === value
              return (
                <button
                  key={opt}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  onClick={() => {
                    onChange(opt)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-base transition-colors",
                    isSelected
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {formatTime(opt)}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
