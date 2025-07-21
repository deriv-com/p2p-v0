"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ProfileAPI } from "../api"
import AddPaymentMethodPanel from "../components/add-payment-method-panel"
import EditPaymentMethodPanel from "../components/edit-payment-method-panel"
import DeleteConfirmationDialog from "../components/delete-confirmation-dialog"
import StatusModal from "../components/ui/status-modal"
import CustomNotificationBanner from "../components/ui/custom-notification-banner"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PaymentMethod {
  id: string
  type: string
  display_name: string
  fields: Record<string, any>
  is_enabled: boolean
}

type FilterType = "all" | "bank_transfer" | "ewallet"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [statusModal, setStatusModal] = useState({
    show: false,
    type: "error" as "success" | "error",
    title: "",
    message: "",
  })

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await ProfileAPI.PaymentMethods.getPaymentMethods()

      if (result.success && result.data) {
        setPaymentMethods(result.data)
      } else {
        setError("Failed to load payment methods")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load payment methods")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const handleBack = () => {
    router.push("/profile")
  }

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsProcessing(true)
      const result = await ProfileAPI.PaymentMethods.addPaymentMethod(method, fields)

      if (result.success) {
        setShowAddPanel(false)
        setNotification({ show: true, message: "Payment method added successfully" })
        await fetchPaymentMethods()
      } else {
        const errorMessage = result.errors?.[0]?.message || "Failed to add payment method"
        setStatusModal({
          show: true,
          type: "error",
          title: "Error",
          message: errorMessage,
        })
      }
    } catch (error) {
      setStatusModal({
        show: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditPaymentMethod = async (fields: Record<string, string>) => {
    if (!selectedMethod) return

    try {
      setIsProcessing(true)
      const result = await ProfileAPI.PaymentMethods.updatePaymentMethod(selectedMethod.id, fields)

      if (result.success) {
        setShowEditPanel(false)
        setSelectedMethod(null)
        setNotification({ show: true, message: "Payment method updated successfully" })
        await fetchPaymentMethods()
      } else {
        const errorMessage = result.errors?.[0]?.message || "Failed to update payment method"
        setStatusModal({
          show: true,
          type: "error",
          title: "Error",
          message: errorMessage,
        })
      }
    } catch (error) {
      setStatusModal({
        show: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeletePaymentMethod = async () => {
    if (!selectedMethod) return

    try {
      setIsProcessing(true)
      const result = await ProfileAPI.PaymentMethods.deletePaymentMethod(selectedMethod.id)

      if (result.success) {
        setShowDeleteDialog(false)
        setSelectedMethod(null)
        setNotification({ show: true, message: "Payment method deleted successfully" })
        await fetchPaymentMethods()
      } else {
        const errorMessage = result.errors?.[0]?.message || "Failed to delete payment method"
        setStatusModal({
          show: true,
          type: "error",
          title: "Error",
          message: errorMessage,
        })
      }
    } catch (error) {
      setStatusModal({
        show: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getFilteredMethods = () => {
    if (activeFilter === "all") return paymentMethods
    if (activeFilter === "bank_transfer") {
      return paymentMethods.filter((method) => method.type === "bank_transfer")
    }
    if (activeFilter === "ewallet") {
      return paymentMethods.filter((method) => method.type === "ewallet")
    }
    return paymentMethods
  }

  const getMethodIcon = (type: string) => {
    if (type === "bank_transfer") {
      return <Image src="/icons/bank-transfer-icon.png" alt="Bank Transfer" width={24} height={24} />
    }
    return <Image src="/icons/ewallet-icon.png" alt="E-wallet" width={24} height={24} />
  }

  const getMethodDisplayValue = (method: PaymentMethod) => {
    if (method.type === "bank_transfer") {
      const accountNumber = method.fields?.account_number || ""
      if (accountNumber.length > 4) {
        return `${"*".repeat(accountNumber.length - 4)}${accountNumber.slice(-4)}`
      }
      return accountNumber
    }
    return method.fields?.account_id || method.fields?.wallet_id || "[ID]"
  }

  const filteredMethods = getFilteredMethods()
  const bankTransferMethods = paymentMethods.filter((method) => method.type === "bank_transfer")
  const ewalletMethods = paymentMethods.filter((method) => method.type === "ewallet")

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-lg font-semibold">Payment methods</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "all" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("bank_transfer")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "bank_transfer" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Bank Transfer
          </button>
          <button
            onClick={() => setActiveFilter("ewallet")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === "ewallet" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            E-wallets
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="flex-shrink-0">
          <CustomNotificationBanner
            message={notification.message}
            onClose={() => setNotification({ show: false, message: "" })}
          />
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-pulse bg-gray-200 w-6 h-6 rounded"></div>
                    <div className="flex-1">
                      <div className="animate-pulse bg-gray-200 h-4 w-24 mb-1 rounded"></div>
                      <div className="animate-pulse bg-gray-200 h-3 w-32 rounded"></div>
                    </div>
                    <div className="animate-pulse bg-gray-200 w-6 h-6 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={fetchPaymentMethods} variant="outline" className="px-6 bg-transparent">
              Try again
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-6 pb-24">
            {/* Bank Transfer Section */}
            {(activeFilter === "all" || activeFilter === "bank_transfer") && bankTransferMethods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Bank transfer</h2>
                <div className="space-y-2">
                  {bankTransferMethods.map((method) => (
                    <Card key={method.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {getMethodIcon(method.type)}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{method.display_name}</p>
                            <p className="text-sm text-gray-500">{getMethodDisplayValue(method)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-2">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMethod(method)
                                  setShowEditPanel(true)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMethod(method)
                                  setShowDeleteDialog(true)
                                }}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* E-wallets Section */}
            {(activeFilter === "all" || activeFilter === "ewallet") && ewalletMethods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">E-wallets</h2>
                <div className="space-y-2">
                  {ewalletMethods.map((method) => (
                    <Card key={method.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {getMethodIcon(method.type)}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{method.display_name}</p>
                            <p className="text-sm text-gray-500">[{getMethodDisplayValue(method)}]</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-2">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMethod(method)
                                  setShowEditPanel(true)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMethod(method)
                                  setShowDeleteDialog(true)
                                }}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredMethods.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-gray-500 text-center mb-4">No payment methods found</p>
                <Button onClick={() => setShowAddPanel(true)} variant="outline" className="px-6">
                  Add payment method
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={() => setShowAddPanel(true)}
          variant="outline"
          className="w-full py-3 text-base font-medium"
          disabled={isProcessing}
        >
          Add payment
        </Button>
      </div>

      {/* Modals and Panels */}
      {showAddPanel && (
        <AddPaymentMethodPanel
          onClose={() => setShowAddPanel(false)}
          onAdd={handleAddPaymentMethod}
          isLoading={isProcessing}
        />
      )}

      {showEditPanel && selectedMethod && (
        <EditPaymentMethodPanel
          paymentMethod={selectedMethod}
          onClose={() => {
            setShowEditPanel(false)
            setSelectedMethod(null)
          }}
          onSave={handleEditPaymentMethod}
          isLoading={isProcessing}
        />
      )}

      {showDeleteDialog && selectedMethod && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false)
            setSelectedMethod(null)
          }}
          onConfirm={handleDeletePaymentMethod}
          isLoading={isProcessing}
          title="Delete payment method"
          message={`Are you sure you want to delete ${selectedMethod.display_name}?`}
        />
      )}

      {statusModal.show && (
        <StatusModal
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onClose={() => setStatusModal((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  )
}
