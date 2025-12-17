"use client"

import { Inbox } from "@novu/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUserDataStore } from "@/stores/user-data-store"
import { useTranslations } from "@/lib/i18n/use-translations"
import Image from "next/image"
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
  const applicationIdentifier = NOTIFICATIONS.applicationId
  const { locale } = useTranslations()

  useEffect(() => {
    setMounted(true)
  }, [])

  const appearance = {
    icons: {
      bell: () => {
        return isMobile ? (
          <Image src="/icons/bell-sm.png" alt="Notifications" width={24} height={24} />
        ) : (
          <Image src="/icons/bell-desktop.png" alt="Notifications" width={24} height={24} />
        )
      },
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
        backgroundColor: isMobile ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
        padding: 0,
      },
      bellContainer: {
        margin: 0,
           width: "32px",
        height: "32px",
      },
      bellIcon: {
       width: "24px",
        height: "24px",
      },
      bellDot: {
        top: "0px",
        right: "0px",
        width: "8px",
        height: "8px",
        border: "none",
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
        i18n={{ lang: locale, poweredBy: "Notifications by" }}
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
