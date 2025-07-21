"use client"
import { useState } from "react"
import { ArrowLeft, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import PaymentMethodsTab from "./payment-methods-tab"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import { ProfileAPI } from "../api"
import StatusModal from "./ui/status-modal"
import NotificationBanner from "./notification-banner"

interface MobilePaymentMethodsPageProps {
  onBack: () => void
}

export default function MobilePaymentMethodsPage({ onBack }: MobilePaymentMethodsPageProps) {
  const [showAddPaymentMethodPanel, setShowAddPaymentMethodPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingPaymentMethod(true)

      const result = await ProfileAPI.PaymentMethods.addPaymentMethod(method, fields)

      if (result.success) {
        setShowAddPaymentMethodPanel(false)

        setNotification({
          show: true,
          message: "Payment method added.",
        })

        setRefreshKey((prev) => prev + 1)
      } else {
        const errorMessage =
          result.errors && result.errors.length > 0 ? result.errors[0].message : "Failed to add payment method"

        setErrorModal({
          show: true,
          message: errorMessage,
        })
      }
    } catch (error) {
      console.error("Error adding payment method:", error)

      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Notification Banner */}
      {notification.show && (
        <NotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">Payment methods</h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddPaymentMethodPanel(true)}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <PaymentMethodsTab key={refreshKey} />
      </div>

      {/* Add Payment Method Panel */}
      {showAddPaymentMethodPanel && (
        <AddPaymentMethodPanel
          onClose={() => setShowAddPaymentMethodPanel(false)}
          onAdd={handleAddPaymentMethod}
          isLoading={isAddingPaymentMethod}
        />
      )}

      {/* Error Modal */}
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
