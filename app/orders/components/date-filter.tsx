"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { DateFilterType, DateRange } from "@/stores/orders-filter-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { SingleMonthCalendar } from "./single-month-calendar"
import { DualMonthCalendar } from "./dual-month-calendar"

interface DateFilterProps {
  value: DateFilterType
  customRange: DateRange
  onValueChange: (value: DateFilterType) => void
  onCustomRangeChange: (range: DateRange) => void
  className?: string
}

function MobileBottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  )
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
      <>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
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

        <MobileBottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="bg-white">
            <SingleMonthCalendar selected={tempRange} onSelect={setTempRange} />

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
        </MobileBottomSheet>
      </>
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
