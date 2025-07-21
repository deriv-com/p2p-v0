"use client"
import { useState, useEffect } from "react"
import { X, CheckCircle } from "lucide-react"

interface NotificationBannerProps {
  message: string
  onClose: () => void
  type?: "success" | "error" | "warning" | "info"
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function NotificationBanner({
  message,
  onClose,
  type = "success",
  autoClose = true,
  autoCloseDelay = 5000,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Allow fade out animation
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay, onClose])

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
      default:
        return "bg-green-50 border-green-200 text-green-800"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <X className="h-5 w-5 text-red-500" />
      case "warning":
        return <X className="h-5 w-5 text-yellow-500" />
      case "info":
        return <X className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`border-l-4 p-4 ${getColorClasses()} transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <p className="ml-3 text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
