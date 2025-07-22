"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface CustomNotificationBannerProps {
  message: string
  onClose: () => void
}

const CustomNotificationBanner: React.FC<CustomNotificationBannerProps> = ({ message, onClose }) => {
  return (
    <div
      className="flex items-center justify-between p-4 mb-4 bg-black border border-black rounded-lg text-white"
      role="alert"
    >
      <div>
        <span className="font-medium">{message}</span>
      </div>
      <Button variant="ghost" onClick={onClose} className="ml-4 text-white hover:text-white/80">
        Close
      </Button>
    </div>
  )
}

export default CustomNotificationBanner
