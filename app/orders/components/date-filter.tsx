"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateFilterType, DateRange } from "@/stores/orders-filter-store"

const formatDate = (date: Date, formatStr: string): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (formatStr === "MMM yyyy") {
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }
  if (formatStr === "MMM dd") {
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`
  }
  if (formatStr === "MMM dd, yyyy") {
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`
  }
  if (formatStr === "d") {
    return String(date.getDate())
  }
  return date.toDateString()
}

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

const eachDayOfInterval = (interval: { start: Date; end: Date }): Date[] => {
  const days: Date[] = []
  const current = new Date(interval.start)

  while (current <= interval.end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

interface DateFilterProps {
  value: DateFilterType
  customRange: DateRange
  onValueChange: (value: DateFilterType) => void
  onCustomRangeChange: (range: DateRange) => void
  className?: string
}

function DualMonthCalendar({
  selected,
  onSelect,
}: {
  selected: DateRange
  onSelect: (range: DateRange) => void
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const nextMonth = addMonths(currentMonth, 1)

  const handleDateClick = (date: Date) => {
    if (!selected.from || (selected.from && selected.to)) {
      // Start new selection
      onSelect({ from: date, to: undefined })
    } else if (selected.from && !selected.to) {
      // Complete the range
      if (date < selected.from) {
        onSelect({ from: date, to: selected.from })
      } else {
        onSelect({ from: selected.from, to: date })
      }
    }
  }

  const isDateSelected = (date: Date) => {
    if (!selected.from) return false
    if (selected.to) {
      return date >= selected.from && date <= selected.to
    }
    return isSameDay(date, selected.from)
  }

  const isDateInRange = (date: Date) => {
    if (!selected.from || !selected.to) return false
    return date > selected.from && date < selected.to
  }

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get the first day of the week for the month
    const firstDayOfWeek = monthStart.getDay()
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Monday = 0

    return (
      <div className="flex-1">
        <div className="text-center font-medium text-gray-900 mb-4">{formatDate(month, "MMM yyyy")}</div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm text-gray-400 font-normal py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for padding */}
          {Array.from({ length: paddingDays }).map((_, index) => (
            <div key={`padding-${index}`} className="h-10" />
          ))}

          {/* Date cells */}
          {days.map((date) => {
            const isSelected = isDateSelected(date)
            const inRange = isDateInRange(date)

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={cn(
                  "h-10 w-10 text-sm font-normal rounded-md hover:bg-gray-100 transition-colors",
                  isSelected && "bg-black text-white hover:bg-black",
                  inRange && "bg-gray-100",
                  !isSameMonth(date, month) && "text-gray-300",
                )}
              >
                {formatDate(date, "d")}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dual month view */}
      <div className="flex gap-8">
        {renderMonth(currentMonth)}
        {renderMonth(nextMonth)}
      </div>
    </div>
  )
}

export function DateFilter({ value, customRange, onValueChange, onCustomRangeChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange>(customRange)

  const getDisplayLabel = () => {
    if (customRange.from) {
      if (customRange.to) {
        return `${formatDate(customRange.from, "MMM dd")} - ${formatDate(customRange.to, "MMM dd")}`
      }
      return formatDate(customRange.from, "MMM dd, yyyy")
    }
    return "All time"
  }

  const handleCustomRangeApply = () => {
    onCustomRangeChange(tempRange)
    onValueChange("custom")
    setIsOpen(false)
  }

  const handleTodayClick = () => {
    const today = new Date()
    const range = { from: today, to: today }
    setTempRange(range)
    onCustomRangeChange(range)
    onValueChange("custom")
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetRange = { from: undefined, to: undefined }
    setTempRange(resetRange)
    onCustomRangeChange(resetRange)
    onValueChange("all")
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
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Select date range</h3>
          </div>

          <DualMonthCalendar selected={tempRange} onSelect={setTempRange} />

          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTodayClick}
              className="rounded-full border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Today
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleCustomRangeApply} disabled={!tempRange.from}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
