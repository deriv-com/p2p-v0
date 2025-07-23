"use client"

import { useTimeRemaining } from "@/hooks/use-time-remaining"
import { cn } from "@/lib/utils"

interface TimeRemainingDisplayProps {
  expiresAt: string
  className?: string
}

export function TimeRemainingDisplay({ expiresAt, className }: TimeRemainingDisplayProps) {
  const timeRemaining = useTimeRemaining(expiresAt)

  return <span className={cn("font-medium", colorClass, className)}>{timeRemaining}</span>
}
