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
  if (timeRemaining.isExpired) {
    return "Expired"
  }

  const { hours, minutes } = timeRemaining

  if (hours > 0) {
    return `${hours}h ${minutes}m left`
  } else if (minutes > 0) {
    return `${minutes}m left`
  } else {
    return "< 1m left"
  }
}
