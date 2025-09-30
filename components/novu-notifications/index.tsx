"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUserDataStore } from "@/stores/user-data-store"
import { Bell } from "lucide-react"
import "../../styles/globals.css"

const API = {
  notificationUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
}

const AUTH = {
  getNotificationHeader: () => ({
    "Content-Type": "application/json",
  }),
}

async function fetchSubscriberHash() {
  try {
    const url = `${API.notificationUrl}/hash`
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: AUTH.getNotificationHeader(),
    })
    if (!response.ok) throw new Error(`Failed to fetch subscriber hash: ${response.status}`)
    const responseData = await response.json()
    const subscriberData = responseData.data?.subscriber || responseData.subscriber
    if (!subscriberData) throw new Error("Invalid response structure: missing subscriber data")
    return {
      subscriberHash: subscriberData.subscriberHash,
      subscriberId: subscriberData.subscriberId,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

export function NovuNotifications() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [subscriberHash, setSubscriberHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriberId, setSubscriberId] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const userId = useUserDataStore((state) => state.userId)
  const userIdFallback = userId || ""

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userIdFallback) {
      setError("No user ID available")
      setIsLoading(false)
      return
    }

    const getSubscriberHash = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchSubscriberHash()
        if (result) {
          setSubscriberHash(result.subscriberHash)
          setSubscriberId(result.subscriberId)
        } else {
          setError("Failed to retrieve subscriber data")
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    getSubscriberHash()
  }, [userIdFallback])

  if (!mounted || isLoading) {
    return (
      <div className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <span className="sr-only">Notifications loading</span>
      </div>
    )
  }

  if (error || !subscriberHash || !subscriberId) {
    return (
      <div
        className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100"
        title={error || "Failed to load notifications"}
      >
        <Bell className="h-4 w-4 text-gray-400" />
        <span className="sr-only">Notifications error</span>
      </div>
    )
  }

  // TODO: Replace with @novu/nextjs Inbox component once React 19 compatibility is resolved
  return (
    <button
      type="button"
      className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      onClick={() => {
        // Placeholder - notifications functionality temporarily disabled
        console.log("[v0] Notifications clicked - Novu integration pending React 19 compatibility")
      }}
      title="Notifications (temporarily unavailable)"
    >
      <Bell className="h-4 w-4 text-gray-700" />
      <span className="sr-only">Notifications</span>
    </button>
  )
}
