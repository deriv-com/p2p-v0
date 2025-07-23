"use client"

import { useTimeRemaining } from "@/hooks/use-time-remaining"
import { calculateTimeRemaining, getTimeRemainingColor } from "@/lib/time-utils"
import { cn } from "@/lib/utils"

interface TimeRemainingDisplayProps {
  expiresAt: string
  className?: string
}

export function TimeRemainingDisplay({ expiresAt, className }: TimeRemainingDisplayProps) {
  const timeRemaining = useTimeRemaining(expiresAt)

  // Get color based on time remaining
  const timeData = calculateTimeRemaining(expiresAt)
  const colorClass = getTimeRemainingColor(timeData)

  return <span className={cn("font-medium", colorClass, className)}>{timeRemaining}</span>
}
