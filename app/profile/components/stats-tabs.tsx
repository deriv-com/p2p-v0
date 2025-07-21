"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

import { StatusModal } from "@/components/status-modal"
import { NotificationBanner } from "@/components/notification-banner"
import { useMobile } from "@/hooks/use-mobile"
import MobileStatsPage from "./mobile-stats-page"
import MobilePaymentMethodsPage from "./mobile-payment-methods-page"

export default function StatsTabs() {
  const isMobile = useMobile()
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [mobileView, setMobileView] = useState<"list" | "stats" | "payment">("list")

  const handleMobileNavigation = (option: string) => {
    if (option === "stats") {
      setMobileView("stats")
    } else if (option === "payment") {
      setMobileView("payment")
    }
  }

  const handleMobileBack = () => {
    setMobileView("list")
  }

  // Mobile view rendering
  if (isMobile) {
    if (mobileView === "stats") {
      return <MobileStatsPage onBack={handleMobileBack} />
    }

    if (mobileView === "payment") {
      return <MobilePaymentMethodsPage onBack={handleMobileBack} />
    }

    // Mobile list view
    return (
      <div className="relative">
        {notification.show && (
          <NotificationBanner
            message={notification.message}
            onClose={() => setNotification({ show: false, message: "" })}
          />
        )}

        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleMobileNavigation("stats")}
          >
            <span className="text-base font-medium text-gray-900">Stats</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleMobileNavigation("payment")}
          >
            <span className="text-base font-medium text-gray-900">Payment methods</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {errorModal.show && (
          <StatusModal
            type="error"
            title="Error"
            message={errorModal.message}
            onClose={() => setErrorModal({ show: false, message: "" })}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <p>Desktop view</p>
    </div>
  )
}
