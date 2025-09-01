"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DateFilterTriggerProps {
  displayLabel: string
  className?: string
}

export function DateFilterTrigger({ displayLabel, className }: DateFilterTriggerProps) {
  return (
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
          <span>{displayLabel}</span>
        </div>
        <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
      </div>
    </Button>
  )
}
