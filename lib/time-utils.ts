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
      hours: 00,
      minutes: 00,
      seconds: 00,
      totalSeconds: 0,
      isExpired: true,
    }
  }

  const totalSeconds = Math.floor(difference / 1000)
  const hours = "0" + Math.floor(totalSeconds / 3600)
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
