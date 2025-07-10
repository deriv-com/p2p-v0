"use client"

import { AUTH } from "@/lib/local-variables"

import { NovuProvider, Popover, NotificationBell, useNotifications, type IPreferenceChannels } from "@novu/react"
import type React from "react"
import { useState, useEffect } from "react"

interface INovuProviderProps {
  children: React.ReactNode
  subscriberId: string
  applicationIdentifier: string
  backendUrl: string
  socketUrl?: string
  initialUnseenCount?: number
  colorScheme?: "light" | "dark"
}

interface INotificationCenterProps {
  onNotificationClick?: (notification: any) => void
  onUnseenCountChanged?: (count: number) => void
  onLoading?: (loading: boolean) => void
  children?: React.ReactNode
  showUserPreferences?: boolean
  showBell?: boolean
  popoverClassName?: string
  bellColor?: string
  emptyStateContent?: React.ReactNode
  footerContent?: React.ReactNode
  headerContent?: React.ReactNode
  preferenceChannels?: IPreferenceChannels
}

const NovuNotificationsProvider: React.FC<INovuProviderProps> = ({
  children,
  subscriberId,
  applicationIdentifier,
  backendUrl,
  socketUrl,
  initialUnseenCount,
  colorScheme,
}) => {
  const [subscriberHash, setSubscriberHash] = useState<string | null>(null)

  useEffect(() => {
    const getSubscriberHash = async () => {
      const hash = await fetchSubscriberHash(subscriberId)
      setSubscriberHash(hash)
    }

    getSubscriberHash()
  }, [subscriberId])

  const fetchSubscriberHash = async (subscriberId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/v1/subscribers/${subscriberId}/hash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH.getAuthHeader(),
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch subscriber hash")
      }

      const data = await response.json()
      return data.hash
    } catch (error) {
      console.error("Error fetching subscriber hash:", error)
      return null
    }
  }

  if (!subscriberHash) {
    return <div>Loading...</div>
  }

  return (
    <NovuProvider
      subscriberId={subscriberId}
      applicationIdentifier={applicationIdentifier}
      backendUrl={backendUrl}
      socketUrl={socketUrl}
      initialUnseenCount={initialUnseenCount}
      subscriberHash={subscriberHash}
      colorScheme={colorScheme}
    >
      {children}
    </NovuProvider>
  )
}

const NotificationCenter: React.FC<INotificationCenterProps> = ({
  onNotificationClick,
  onUnseenCountChanged,
  onLoading,
  children,
  showUserPreferences = true,
  showBell = true,
  popoverClassName,
  bellColor,
  emptyStateContent,
  footerContent,
  headerContent,
  preferenceChannels,
}) => {
  const { unseen, notifications, fetching, refetch, setUnseen } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (onUnseenCountChanged) {
      onUnseenCountChanged(unseen)
    }
  }, [unseen, onUnseenCountChanged])

  useEffect(() => {
    if (onLoading) {
      onLoading(fetching)
    }
  }, [fetching, onLoading])

  const handleNotificationClick = (notification: any) => {
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  const togglePopover = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnseen(0)
    }
  }

  return (
    <Popover className={popoverClassName} isOpen={isOpen} toggle={togglePopover}>
      {showBell && <NotificationBell unseenCount={unseen} color={bellColor} />}
      <Popover.Panel className="w-[360px]">
        {headerContent}
        {children ? (
          children
        ) : (
          <div className="h-[300px] flex flex-col">
            {notifications.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                {emptyStateContent || <div>No notifications</div>}
              </div>
            ) : (
              <ul className="overflow-y-auto">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {footerContent}
      </Popover.Panel>
    </Popover>
  )
}

export { NovuNotificationsProvider, NotificationCenter }
