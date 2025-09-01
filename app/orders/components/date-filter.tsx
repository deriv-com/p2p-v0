"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
import Image from "next/image"
import type { DateFilterType, DateRange } from "@/stores/orders-filter-store"

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
      onSelect({ from: date, to: undefined })
    } else if (selected.from && !selected.to) {
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

    const firstDayOfWeek = monthStart.getDay()
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    return (
      <div className="flex-1">
        <div className="text-center text-grayscale-600 mb-4">{format(month, "MMM yyyy")}</div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm text-gray-400 font-normal py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: paddingDays }).map((_, index) => (
            <div key={`padding-${index}`} className="h-10" />
          ))}
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
      <div className="flex gap-8">
        {renderMonth(currentMonth)}
        {renderMonth(nextMonth)}
      </div>
    </div>
  )
}

export function DateFilter({ customRange, onValueChange, onCustomRangeChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange>(customRange)

  const getDisplayLabel = () => {
    if (customRange.from) {
      if (customRange.to) {
        return `${format(customRange.from, "dd/MM/yyyy")} to ${format(customRange.to, "dd/MM/yyyy")}`
      }
      return format(customRange.from, "dd/MM/yyyy")
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
            "w-full rounded-md border border-input bg-background font-normal min-h-[32px] h-[32px] lg:min-h-[40px] lg:h-[40px] px-3 hover:bg-transparent focus:border-black",
            className,
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Image src="/icons/calendar.png" alt="Calendar" width={24} height={24} className="text-gray-500" />
              <span>{getDisplayLabel()}</span>
            </div>
            <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="bg-white">
          <DualMonthCalendar selected={tempRange} onSelect={setTempRange} />

          <div className="flex items-center justify-between p-4">
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
