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

  const handleDateClick = (date: Date) => {
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

  const renderMonth = (month: Date, isPrevVisible, isNextVisible) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const firstDayOfWeek = monthStart.getDay()
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    return (
      <div className="flex-1">
        <div className="flex">
          {isPrevVisible && (<Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>)}
          <div className="text-center text-grayscale-600 mb-4">{format(month, "MMM yyyy")}</div>
          {isNextVisible && (<Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>)}
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

            return (
              <Button
                key={date.toISOString()}
                variant="ghost"
                size="sm"
                onClick={() => handleDateClick(date)}
                className={cn(
                  "font-normal rounded-md hover:bg-gray-100 transition-colors text-grayscale-600",
                  isSelected && "bg-black text-white hover:bg-black hover:text-white",
                  inRange && "bg-gray-100 hover:text-white text-grayscale-600",
                  !isSameMonth(date, month) && "text-gray-300",
                )}
              >
                {format(date, "d")}
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
