"use client"

import { Inbox } from "@novu/nextjs"
import { useEffect, useState } from "react"
import { API, AUTH, USER, NOTIFICATIONS } from "@/lib/local-variables"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import "../../styles/globals.css"

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
  const userIdFallback = USER.id || ""
  const applicationIdentifier = NOTIFICATIONS.applicationId

  useEffect(() => {
    setMounted(true)
  }, [])

  const BellIcon = () => {
    if (!mounted) {
      // Default bell icon as SVG
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C13.1 2 14 2.9 14 4C14 4.78 13.64 5.47 13.06 5.85C15.84 6.87 18 9.61 18 12.97V16L20 18V19H4V18L6 16V12.97C6 9.61 8.16 6.87 10.94 5.85C10.36 5.47 10 4.78 10 4C10 2.9 10.9 2 12 2ZM10 20H14C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20Z"
            fill="currentColor"
          />
        </svg>
      )
    }

    return isMobile ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2C13.1 2 14 2.9 14 4C14 4.78 13.64 5.47 13.06 5.85C15.84 6.87 18 9.61 18 12.97V16L20 18V19H4V18L6 16V12.97C6 9.61 8.16 6.87 10.94 5.85C10.36 5.47 10 4.78 10 4C10 2.9 10.9 2 12 2ZM10 20H14C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20Z"
          fill="currentColor"
        />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2C13.1 2 14 2.9 14 4C14 4.78 13.64 5.47 13.06 5.85C15.84 6.87 18 9.61 18 12.97V16L20 18V19H4V18L6 16V12.97C6 9.61 8.16 6.87 10.94 5.85C10.36 5.47 10 4.78 10 4C10 2.9 10.9 2 12 2ZM10 20H14C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  const appearance = {
    icons: {
      bell: BellIcon,
    },
    variables: {
      borderRadius: "8px",
      fontSize: "16px",
      colorShadow: "rgba(0, 0, 0, 0.1)",
      colorNeutral: "#1A1523",
      colorCounterForeground: "#ffffff",
      colorCounter: "#FF444F",
      colorSecondaryForeground: "#1A1523",
      colorPrimaryForeground: "#ffffff",
      colorPrimary: "#FF444F",
      colorForeground: "#181C25",
      colorBackground: "#ffffff",
    },
    elements: {
      popoverTrigger: {
        borderRadius: "50%",
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      bellContainer: {
        width: "24px",
        height: "24px",
      },
      bellIcon: {
        width: "24px",
        height: "24px",
      },
      preferences__button: { display: "none" },
      popoverContent: "novu-popover-content",
    },
  }

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
        localization={{ "inbox.filters.labels.default": "Notifications" }}
        colorScheme="light"
        i18n={{ poweredBy: "Notifications by" }}
        onNotificationClick={(notification) => {
          if (notification.data?.order_id) {
            router.push(`/orders/${notification.data.order_id}`)
          }

          setTimeout(() => {
            const inboxElement = document.querySelector(".nv-popoverContent") as HTMLElement
            if (inboxElement) {
              const clickOutsideEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window,
              })
              document.body.dispatchEvent(clickOutsideEvent)
            }
          }, 100)
        }}
        placement={isMobile ? "bottom-start" : "bottom-end"}
        appearance={appearance}
        styles={{
          bell: { root: { background: "transparent", color: "black" } },
          popover: { root: { zIndex: 100 } },
        }}
      />
    </div>
  )
}
