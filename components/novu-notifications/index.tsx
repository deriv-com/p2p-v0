"use client"

import { useEffect, useState } from "react"
import { AUTH } from "@/services/api"

interface NovuNotificationsProps {
  userId?: string
}

export default function NovuNotifications({ userId }: NovuNotificationsProps) {
  const [subscriberHash, setSubscriberHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscriberHash = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/subscribers/${userId}/hash`, {
          method: "POST",
          headers: AUTH.getAuthHeader(),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch subscriber hash")
        }

        const data = await response.json()
        setSubscriberHash(data.hash)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriberHash()
  }, [userId])

  if (isLoading) {
    return <div>Loading notifications...</div>
  }

  if (error) {
    return <div>Error loading notifications: {error}</div>
  }

  if (!subscriberHash) {
    return null
  }

  return <div id="novu-notifications">{/* Novu notification component will be rendered here */}</div>
}
