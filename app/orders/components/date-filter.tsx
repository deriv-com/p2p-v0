"use client"

import * as React from "react"
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns"
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
        <div className="text-center font-medium text-gray-900 mb-4">{format(month, "MMM yyyy")}</div>

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
                {format(date, "d")}
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
      <PopoverContent className="w-auto p-0" align="start">
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
          <div className="bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Select date range</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)}>
                Back
              </Button>
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
