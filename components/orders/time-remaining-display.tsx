"use client"

import { useTimeRemaining } from "@/hooks/use-time-remaining"

interface TimeRemainingDisplayProps {
  expiresAt: string
}

export function TimeRemainingDisplay({ expiresAt, className }: TimeRemainingDisplayProps) {
  const timeRemaining = useTimeRemaining(expiresAt)

  return <span>{timeRemaining}</span>
}
