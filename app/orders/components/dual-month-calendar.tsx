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
import { cn } from "@/lib/utils"
import type { DateRange } from "@/stores/orders-filter-store"

interface DualMonthCalendarProps {
  selected: DateRange
  onSelect: (range: DateRange) => void
  handleCustomRangeApply: () => void
}

export function DualMonthCalendar({ selected, onSelect, handleCustomRangeApply }: DualMonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const nextMonth = addMonths(currentMonth, 1)

  const isFutureDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate > today
  }

  const handleDateClick = (date: Date) => {
    if (isFutureDate(date)) return

    if (!selected.from || (selected.from && selected.to)) {
      onSelect({ from: date, to: undefined })
    } else if (selected.from && !selected.to) {
      if (date < selected.from) {
        onSelect({ from: date, to: selected.from })
        handleCustomRangeApply(date, selected.from)
      } else {
        onSelect({ from: selected.from, to: date })
        handleCustomRangeApply(selected.from, date)
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

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const renderMonth = (month: Date, isPrevVisible, isNextVisible) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const firstDayOfWeek = monthStart.getDay()
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    return (
      <div className="flex-1">
        <div className="flex">
          {isPrevVisible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="text-center text-grayscale-600 mb-4 m-auto">{format(month, "MMM yyyy")}</div>
          {isNextVisible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
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
            const today = isToday(date)
            const isFuture = isFutureDate(date)

            return (
              <Button
                key={date.toISOString()}
                variant="ghost"
                size="sm"
                onClick={() => handleDateClick(date)}
                disabled={isFuture}
                className={cn(
                  "font-normal rounded-md hover:bg-gray-100 transition-colors text-grayscale-600 relative",
                  isSelected && "bg-black text-white hover:bg-black hover:text-white",
                  inRange && "bg-gray-100 hover:text-white text-grayscale-600",
                  !isSameMonth(date, month) && "text-gray-300",
                  isFuture && "opacity-50 cursor-not-allowed hover:bg-transparent",
                )}
              >
                <span className="flex flex-col items-center gap-0.5">
                  {format(date, "d")}
                  {today && <span className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-black")} />}
                </span>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex gap-8">
        {renderMonth(currentMonth, true, false)}
        {renderMonth(nextMonth, false, true)}
      </div>
    </div>
  )
}
