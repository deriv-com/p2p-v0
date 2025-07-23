"use client"

import { useTimeRemaining } from "@/hooks/use-time-remaining"

interface TimeRemainingDisplayProps {
  expiresAt: string
}

export function TimeRemainingDisplay({ expiresAt }: TimeRemainingDisplayProps) {
  const timeRemaining = useTimeRemaining(expiresAt)

  return <span>{timeRemaining}</span>
}
