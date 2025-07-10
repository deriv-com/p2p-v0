"use client"

import { Inbox } from "@novu/react"
import { useEffect, useState } from "react"
import { AUTH } from "@/lib/local-variables"

export default function NovuNotifications() {
  const [subscriberHash, setSubscriberHash] = useState<string>("")

  useEffect(() => {
    const fetchSubscriberHash = async () => {
      try {
        const response = await fetch("/api/novu/subscriber-hash", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...AUTH.getAuthHeader(),
          },
          body: JSON.stringify({ subscriberId: "user-123" }),
        })

        if (response.ok) {
          const data = await response.json()
          setSubscriberHash(data.hash)
        }
      } catch (error) {
        console.error("Failed to fetch subscriber hash:", error)
      }
    }

    fetchSubscriberHash()
  }, [])

  return (
    <div className="novu-notifications">
      <Inbox
        applicationIdentifier={process.env.NEXT_PUBLIC_NOTIFICATION_APPLICATION_ID || ""}
        subscriberId="user-123"
        subscriberHash={subscriberHash}
        appearance={{
          elements: {
            bellIcon: {
              width: "24px",
              height: "24px",
            },
          },
        }}
        onNotificationClick={(notification) => {
          console.log("Notification clicked:", notification)
          // Handle notification click
        }}
        onUnseenCountChanged={(count) => {
          console.log("Unseen count changed:", count)
          // Handle unseen count change
        }}
      />
    </div>
  )
}
