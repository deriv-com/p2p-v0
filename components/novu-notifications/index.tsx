"use client"

import { NovuProvider, PopoverNotificationCenter } from "@novu/notification-center"
import { useEffect, useState } from "react"
import { AUTH } from "@/lib/local-variables"

interface NotificationCenterProps {
  subscriberId: string
  applicationIdentifier: string
}

export default function NotificationCenter({ subscriberId, applicationIdentifier }: NotificationCenterProps) {
  const [subscriberHash, setSubscriberHash] = useState<string>("")

  const fetchSubscriberHash = async () => {
    try {
      const response = await fetch("/api/novu/subscriber-hash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH.getAuthHeader(),
        },
        credentials: "include",
        body: JSON.stringify({ subscriberId }),
      })

      if (response.ok) {
        const data = await response.json()
        setSubscriberHash(data.hash)
      }
    } catch (error) {
      console.error("Failed to fetch subscriber hash:", error)
    }
  }

  useEffect(() => {
    if (subscriberId) {
      fetchSubscriberHash()
    }
  }, [subscriberId])

  const onNotificationClick = (message: any) => {
    // Handle notification click
    console.log("Notification clicked:", message)
  }

  const onUnseenCountChanged = (unseenCount: number) => {
    // Handle unseen count change
    console.log("Unseen count:", unseenCount)
  }

  const onActionClick = (templateIdentifier: string, type: string, message: any) => {
    // Handle action click
    console.log("Action clicked:", { templateIdentifier, type, message })
  }

  if (!subscriberHash) {
    return null
  }

  return (
    <NovuProvider
      subscriberId={subscriberId}
      applicationIdentifier={applicationIdentifier}
      subscriberHash={subscriberHash}
    >
      <PopoverNotificationCenter
        onNotificationClick={onNotificationClick}
        onUnseenCountChanged={onUnseenCountChanged}
        onActionClick={onActionClick}
        colorScheme="light"
      >
        {({ unseenCount }) => (
          <button className="relative p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM11 19H6.334C5.597 19 5 18.403 5 17.666V4.334C5 3.597 5.597 3 6.334 3h11.332C18.403 3 19 3.597 19 4.334V11"
              />
            </svg>
            {unseenCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unseenCount}
              </span>
            )}
          </button>
        )}
      </PopoverNotificationCenter>
    </NovuProvider>
  )
}
