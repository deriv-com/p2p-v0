"use client"

import { useTimeRemaining } from "@/hooks/use-time-remaining"
import { formatTimeRemaining, getTimeRemainingColor } from "@/lib/time-utils"

interface TimeRemainingDisplayProps {
  expiresAt: string | null
  className?: string
}

export function TimeRemainingDisplay({ expiresAt, className = "" }: TimeRemainingDisplayProps) {
  const timeRemaining = useTimeRemaining(expiresAt)

  if (!timeRemaining) {
    return <span className={className}>-</span>
  }

  const colorClass = getTimeRemainingColor(timeRemaining)
  const formattedTime = formatTimeRemaining(timeRemaining)

  return <span className={`${colorClass} ${className} font-medium`}>{formattedTime}</span>
}
