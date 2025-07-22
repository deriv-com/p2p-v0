"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomNotificationBannerProps {
  message: string
  onClose: () => void
}

export default function CustomNotificationBanner({ message, onClose }: CustomNotificationBannerProps) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px]">
      <span className="flex-1 text-sm font-medium">{message}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="p-1 h-auto text-white hover:text-white/80 hover:bg-transparent"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
