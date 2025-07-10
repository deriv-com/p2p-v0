"use client"

import { NovuProvider, PopoverNotificationCenter } from "@novu/notification-center"
import { useEffect, useState } from "react"
import { AUTH } from "@/lib/local-variables"

const fetchSubscriberHash = async (subscriberId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/subscriber-hash`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...AUTH.getAuthHeader(),
    },
    credentials: "include",
    body: JSON.stringify({ subscriberId }),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch subscriber hash")
  }

  const data = await response.json()
  return data.hash
}

function NotificationCenter() {
  const [subscriberHash, setSubscriberHash] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSubscriberHash = async () => {
      try {
        const hash = await fetchSubscriberHash(process.env.NEXT_PUBLIC_WALLETS_USER_ID || "")
        setSubscriberHash(hash)
      } catch (error) {
        console.error("Error fetching subscriber hash:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (process.env.NEXT_PUBLIC_WALLETS_USER_ID) {
      getSubscriberHash()
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return <div>Loading notifications...</div>
  }

  if (!process.env.NEXT_PUBLIC_WALLETS_USER_ID || !subscriberHash) {
    return null
  }

  return (
    <NovuProvider
      subscriberId={process.env.NEXT_PUBLIC_WALLETS_USER_ID}
      applicationIdentifier={process.env.NEXT_PUBLIC_NOTIFICATION_APPLICATION_ID || ""}
      subscriberHash={subscriberHash}
    >
      <PopoverNotificationCenter colorScheme="light">
        {({ unseenCount }) => (
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100">
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
                  d="M15 17h5l-5 5v-5zM9 7V3a1 1 0 011-1h4a1 1 0 011 1v4M9 7a3 3 0 00-3 3v4a3 3 0 003 3h6a3 3 0 003-3v-4a3 3 0 00-3-3M9 7h6"
                />
              </svg>
            </button>
            {unseenCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unseenCount}
              </span>
            )}
          </div>
        )}
      </PopoverNotificationCenter>
    </NovuProvider>
  )
}

export default NotificationCenter
