"use client"

// import { Inbox } from "@novu/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUserDataStore } from "@/stores/user-data-store"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import "../../styles/globals.css"

const API = {
  notificationUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
}

const AUTH = {
  getNotificationHeader: () => ({
    "Content-Type": "application/json",
  }),
}

const NOTIFICATIONS = {
  applicationId: process.env.NEXT_PUBLIC_NOTIFICATION_APPLICATION_ID,
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
      <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <span className="sr-only">Notifications loading</span>
      </div>
    )
  }

  if (error || !subscriberHash || !subscriberId) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
        title={error || "Failed to load notifications"}
        disabled
      >
        {isMobile ? (
          <Image src="/icons/bell-sm.png" alt="Notifications" width={24} height={24} className="opacity-50" />
        ) : (
          <Image src="/icons/bell-desktop.png" alt="Notifications" width={24} height={24} className="opacity-50" />
        )}
        <span className="sr-only">Notifications error</span>
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200">
          {isMobile ? (
            <Image src="/icons/bell-sm.png" alt="Notifications" width={24} height={24} />
          ) : (
            <Image src="/icons/bell-desktop.png" alt="Notifications" width={24} height={24} />
          )}
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            0
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={isMobile ? "start" : "end"} className="w-80">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Notifications</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Image
              src="/icons/bell-desktop.png"
              alt="No notifications"
              width={48}
              height={48}
              className="mb-4 opacity-50"
            />
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="mt-1 text-xs text-gray-400">Notifications will appear here when you have updates</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
