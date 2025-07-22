"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface CustomNotificationBannerProps {
  message: string
  onClose: () => void
  duration?: number
}

export default function CustomNotificationBanner({ message, onClose, duration = 5000 }: CustomNotificationBannerProps) {
  // Auto-close the notification after the specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 mx-auto p-4 flex justify-center">
      <div className="bg-black text-white px-4 py-3 rounded-md shadow-md flex items-center max-w-md w-full">
        <span className="flex-grow">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-white/80 flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
