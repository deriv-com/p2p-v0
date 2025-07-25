export interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isExpired: boolean
}

export function calculateTimeRemaining(expiresAt: string): TimeRemaining {
  const now = new Date().getTime()
  const expiry = new Date(expiresAt).getTime()
  const difference = expiry - now

  if (difference <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    }
  }

  const totalSeconds = Math.floor(difference / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
  }
}

export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  const { hours, minutes, seconds, isExpired } = timeRemaining

  if (isExpired) {
    return "00:00:00"
  }

  const pad = (n: number) => String(n).padStart(2, "0")

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  return `${pad(minutes)}:${pad(seconds)}`
}

export function getTimeRemainingColor(timeRemaining: TimeRemaining): string {
  const { totalSeconds, isExpired } = timeRemaining

  if (isExpired) {
    return "text-red-600"
  }

  // Less than 5 minutes - red (urgent)
  if (totalSeconds < 300) {
    return "text-red-600"
  }

  // Less than 15 minutes - yellow (warning)
  if (totalSeconds < 900) {
    return "text-yellow-600"
  }

  // More than 15 minutes - green (safe)
  return "text-green-600"
}
