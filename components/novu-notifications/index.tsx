"use client"

// The @novu/nextjs Inbox component uses img elements in a way that's not compatible with React 19
// This is a placeholder until Novu updates their library

import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import "../../styles/globals.css"

export function NovuNotifications() {
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Placeholder notification bell until Novu is React 19 compatible
  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        type="button"
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        disabled
      >
        {isMobile ? (
          <Image src="/icons/bell-sm.png" alt="Notifications" width={24} height={24} />
        ) : (
          <Image src="/icons/bell-desktop.png" alt="Notifications" width={24} height={24} />
        )}
      </button>
    </div>
  )
}
