"use client"

import * as React from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { DateFilterType, DateRange } from "@/stores/orders-filter-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { SingleMonthCalendar } from "./single-month-calendar"
import { DualMonthCalendar } from "./dual-month-calendar"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface DateFilterProps {
  value: DateFilterType
  customRange: DateRange
  onValueChange: (value: DateFilterType) => void
  onCustomRangeChange: (range: DateRange) => void
  className?: string
}

export function DateFilter({ customRange, onValueChange, onCustomRangeChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange>(customRange)
  const isMobile = useIsMobile()

  const getDisplayLabel = () => {
    if (customRange.from) {
      if (customRange.to) {
        if (customRange.from == customRange.to) {
          return format(customRange.from, "dd/MM/yyyy")
        }
        return `${format(customRange.from, "dd/MM/yyyy")} to ${format(customRange.to, "dd/MM/yyyy")}`
      }
      return format(customRange.from, "dd/MM/yyyy")
    }
    return "All time"
  }

  const handleCustomRangeApply = () => {
    const normalizedRange = {
      from: tempRange.from
        ? new Date(tempRange.from.getFullYear(), tempRange.from.getMonth(), tempRange.from.getDate())
        : undefined,
      to: tempRange.to
        ? new Date(tempRange.to.getFullYear(), tempRange.to.getMonth(), tempRange.to.getDate())
        : undefined,
    }
    onCustomRangeChange(normalizedRange)
    onValueChange("custom")
    setIsOpen(false)
  }

  const handleCustomRange = (fromDate, toDate) => {
    const normalizedRange = {
      from: fromDate
        ? new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
        : undefined,
      to: toDate
        ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
        : undefined,
    }
    onCustomRangeChange(normalizedRange)
    onValueChange("custom")
    setIsOpen(false)
  }

  const handleTodayClick = () => {
    const today = new Date()
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const range = { from: normalizedToday, to: normalizedToday }
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

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
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
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
          <div className="bg-white">
            <SingleMonthCalendar selected={tempRange} onSelect={setTempRange} />

            <div className="flex items-center justify-end p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTodayClick}
                className="rounded-full"
              >
                <Image src="/icons/calendar-arrow.png" alt="Calendar" width={16} height={16} />
                Today
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent">
                Reset
              </Button>
              <Button variant="black" onClick={handleCustomRangeApply} className="flex-1" disabled={!tempRange.from}>
                Confirm
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
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
      <PopoverContent className="w-auto p-0" align="end">
        <div className="relative">
          <DualMonthCalendar handleCustomRangeApply={handleCustomRange} selected={tempRange} onSelect={setTempRange} />

          <div className="flex items-center justify-end p-6">
            <Button
              variant="outline"
              onClick={handleTodayClick}
              className="rounded-full"
            >
               <Image src="/icons/calendar-arrow.png" alt="Calendar" width={14} height={14} />
              Today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
