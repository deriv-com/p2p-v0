"use client"

import * as React from "react"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateFilterType, DateRange } from "@/stores/orders-filter-store"

interface DateFilterProps {
  value: DateFilterType
  customRange: DateRange
  onValueChange: (value: DateFilterType) => void
  onCustomRangeChange: (range: DateRange) => void
  className?: string
}

const dateFilterOptions = [
  { value: "all" as const, label: "All time" },
  { value: "today" as const, label: "Today" },
  { value: "week" as const, label: "Past 7 days" },
  { value: "month" as const, label: "Past 30 days" },
  { value: "custom" as const, label: "Custom range" },
]

export function DateFilter({ value, customRange, onValueChange, onCustomRangeChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showCalendar, setShowCalendar] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange>(customRange)

  const getDisplayLabel = () => {
    const option = dateFilterOptions.find((opt) => opt.value === value)
    if (value === "custom" && customRange.from) {
      if (customRange.to) {
        return `${format(customRange.from, "MMM dd")} - ${format(customRange.to, "MMM dd")}`
      }
      return format(customRange.from, "MMM dd, yyyy")
    }
    return option?.label || "All time"
  }

  const handleOptionSelect = (filterValue: DateFilterType) => {
    if (filterValue === "custom") {
      setShowCalendar(true)
      return
    }

    onValueChange(filterValue)
    setIsOpen(false)
  }

  const handleCustomRangeApply = () => {
    onCustomRangeChange(tempRange)
    onValueChange("custom")
    setShowCalendar(false)
    setIsOpen(false)
  }

  const handleTodayClick = () => {
    const today = new Date()
    const range = { from: today, to: today }
    setTempRange(range)
    onCustomRangeChange(range)
    onValueChange("custom")
    setShowCalendar(false)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-left font-normal",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span>{getDisplayLabel()}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {!showCalendar ? (
          <div className="p-2">
            {dateFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                  value === option.value && "bg-gray-100 font-medium",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Select date range</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)}>
                Back
              </Button>
            </div>
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={(range) => setTempRange(range || { from: undefined, to: undefined })}
              numberOfMonths={2}
              className="rounded-md border"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleTodayClick} className="rounded-full bg-transparent">
                Today
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTempRange({ from: undefined, to: undefined })
                    setShowCalendar(false)
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCustomRangeApply} disabled={!tempRange.from}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
