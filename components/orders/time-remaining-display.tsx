"use client"

import { useTimeRemaining } from "@/hooks/use-time-remaining"
import { formatTimeRemaining, getTimeRemainingColor } from "@/lib/time-utils"
import { cn } from "@/lib/utils"

interface TimeRemainingDisplayProps {
  expiresAt: string
  className?: string
}

export function TimeRemainingDisplay({ expiresAt, className }: TimeRemainingDisplayProps) {
  const timeRemaining = useTimeRemaining(expiresAt)
  const formattedTime = formatTimeRemaining(timeRemaining)
  const colorClass = getTimeRemainingColor(timeRemaining)

  return <span className={cn("font-medium", colorClass, className)}>{formattedTime}</span>
}
