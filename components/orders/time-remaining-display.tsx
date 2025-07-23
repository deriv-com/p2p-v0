"use client"

import { useTimeRemaining } from "@/hooks/use-time-remaining"
import { cn } from "@/lib/utils"

interface TimeRemainingDisplayProps {
  expiresAt: string
  className?: string
}

export function TimeRemainingDisplay({ expiresAt }: TimeRemainingDisplayProps) {
  const timeRemaining = useTimeRemaining(expiresAt)

  return <span>{timeRemaining}</span>
}
