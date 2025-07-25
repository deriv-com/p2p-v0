"use client"

import { Inbox } from "@novu/nextjs"
import { useEffect, useState } from "react"
import { AUTH, USER, NOTIFICATIONS } from "@/lib/local-variables"

import { useRouter } from "next/navigation"

async function fetchSubscriberHash() {
  try {
    const url = `${NOTIFICATIONS.subscriberHashUrl}/hash`

    const response = await fetch(url, {
      method: "POST",
      headers: AUTH.getNotificationHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriber hash: ${response.status}`)
    }

    const responseData = await response.json()

    const subscriberData = responseData.data?.subscriber || responseData.subscriber

    if (!subscriberData) {
      throw new Error("Invalid response structure: missing subscriber data")
    }

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

  const userIdFallback = USER.id || ""
  const applicationIdentifier = NOTIFICATIONS.applicationId

  const appearance = {
    variables: {
      borderRadius: "8px",
      fontSize: "16px",
      colorShadow: "rgba(0, 0, 0, 0.1)",
      colorNeutral: "#1A1523",
      colorCounterForeground: "#ffffff",
      colorCounter: "#00D0FF",
      colorSecondaryForeground: "#1A1523",
      colorSecondary: "#002A33",
      colorPrimaryForeground: "#ffffff",
      colorPrimary: "#00D0FF",
      colorForeground: "#181C25",
      colorBackground: "#ffffff",
    },
    elements: {
      "nv-preferences__button": {
        display: "none",
      },
    },
  }

  useEffect(() => {
    setMounted(true)

    // Only fetch if we have a user ID fallback
    if (!userIdFallback) {
      setError("No user ID available")
      setIsLoading(false)
      return
    }

    // Fetch the subscriber hash
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
      <div className="relative inline-flex h-5 w-5 bg-yellow-100 rounded-full">
        <span className="sr-only">Notifications loading</span>
      </div>
    )
  }

  if (error || !subscriberHash || !subscriberId) {
    return (
      <div
        className="relative inline-flex h-5 w-5 bg-red-100 rounded-full"
        title={error || "Failed to load notifications"}
      >
        <span className="sr-only">Notifications error</span>
      </div>
    )
  }

  return (
    <div style={{ position: "static" }}>
      <Inbox
        applicationIdentifier={applicationIdentifier}
        subscriber={subscriberId || ""}
        subscriberHash={subscriberHash}
        localization={{
          "inbox.filters.labels.default": "Notifications",
        }}
        colorScheme="light"
        i18n={{
          poweredBy: "Notifications by",
        }}
        onNotificationClick={(notification) => {
          if (notification.data && notification.data["order_id"]) {
            const orderId = notification.data["order_id"]
            router.push(`/orders/${orderId}`)
          }
        }}
        placement="bottom-end"
        appearance={appearance}
        styles={{
          bell: {
            root: {
              background: "transparent",
              color: "black",
            },
          },
          popover: {
            root: {
              zIndex: 100,
            },
          },
        }}
      />
    </div>
  )
}
