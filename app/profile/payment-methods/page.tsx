"use client"

import { Button } from "@/components/ui/button"
import { maskAccountNumber } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { API, AUTH } from "@/lib/local-variables"
import { CustomShimmer } from "../components/ui/custom-shimmer"
import { ProfileAPI } from "../api"
import CustomNotificationBanner from "../components/ui/custom-notification-banner"
import EditPaymentMethodPanel from "../components/edit-payment-method-panel"
import AddPaymentMethodPanel from "../components/add-payment-method-panel"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

interface PaymentMethod {
  id: string
  name: string
  type: string
  category: "bank_transfer" | "e_wallet" | "other"
  details: Record<string, any>
  instructions?: string
  isDefault?: boolean
}

type FilterType = "all" | "bank_transfer" | "e_wallet"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { showDeleteDialog, showAlert } = useAlertDialog()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [showAddPaymentMethodPanel, setShowAddPaymentMethodPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)

  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })

  const [editPanel, setEditPanel] = useState({
    show: false,
    paymentMethod: null as PaymentMethod | null,
  })
  const [isEditing, setIsEditing] = useState(false)

  const [bottomSheet, setBottomSheet] = useState({
    show: false,
    paymentMethod: null as PaymentMethod | null,
  })

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = `${API.baseUrl}/user-payment-methods`
      const headers = AUTH.getAuthHeader()
      const response = await fetch(url, {
        headers,
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Error fetching payment methods: ${response.statusText}`)
      }

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse payment methods response:", e)
        data = { data: [] }
      }

      const methodsData = data.data || []

      const transformedMethods = methodsData.map((method: any) => {
        const methodType = method.method || ""

        let category: "bank_transfer" | "e_wallet" | "other" = "other"

        if (method.type === "bank") {
          category = "bank_transfer"
        } else if (method.type === "ewallet") {
          category = "e_wallet"
        }

        let instructions = ""
        if (method.fields?.instructions?.value) {
          instructions = method.fields.instructions.value
        }

        const name = method.display_name || methodType.charAt(0).toUpperCase() + methodType.slice(1)

        const transformedDetails: Record<string, { display_name: string; required: boolean; value: string }> = {}

        if (method.fields) {
          Object.entries(method.fields).forEach(([fieldName, fieldData]: [string, any]) => {
            transformedDetails[fieldName] = {
              display_name:
                fieldData.display_name || fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              required: fieldData.required || false,
              value: fieldData.value || "",
            }
          })
        }

        return {
          id: String(method.id || ""),
          name: name,
          type: methodType,
          category: category,
          details: transformedDetails,
          instructions: instructions,
          isDefault: false,
        }
      })

      setPaymentMethods(transformedMethods)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load payment methods")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    const cleanedMethod = {
      ...method,
      details: { ...method.details },
    }

    setBottomSheet({ show: false, paymentMethod: null })
    setEditPanel({
      show: true,
      paymentMethod: cleanedMethod,
    })
  }

  const handleSavePaymentMethod = async (id: string, fields: Record<string, string>) => {
    try {
      setIsEditing(true)

      const paymentMethod = paymentMethods.find((m) => m.id === id)

      const payload = {
        method: paymentMethod.type,
        fields: { ...fields },
      }

      const result = await ProfileAPI.PaymentMethods.updatePaymentMethod(id, payload)

      if (result.success) {
        setNotification({
          show: true,
          message: "Payment method details updated successfully.",
        })

        fetchPaymentMethods()
      } else {
        let errorMessage = "Failed to update payment method. Please try again."

        if (result.errors && result.errors.length > 0) {
          const errorCode = result.errors[0].code

          if (errorCode === "PaymentMethodUsedByOpenOrder") {
            errorMessage = "This payment method is currently being used by an open order and cannot be modified."
          } else if (result.errors[0].message) {
            errorMessage = result.errors[0].message
          }
        }

        showAlert({
          type: "warning",
          title: "Failed to update payment method",
          description: errorMessage,
          confirmText: "OK",
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")

      showAlert({
        type: "warning",
        title: "Failed to update payment method",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        confirmText: "OK",
      })
    } finally {
      setEditPanel({
        show: false,
        paymentMethod: null,
      })
      setIsEditing(false)
    }
  }

  const handleDeletePaymentMethod = (id: string, name: string) => {
    setBottomSheet({ show: false, paymentMethod: null })

    showDeleteDialog({
      title: `Delete ${name}?`,
      description: `Are you sure you want to delete this payment method?`,
      onConfirm: () => confirmDeletePaymentMethod(id),
    })
  }

  const confirmDeletePaymentMethod = async (methodId: string) => {
    try {
      const result = await ProfileAPI.PaymentMethods.deletePaymentMethod(methodId)

      if (result.success) {
        setNotification({
          show: true,
          message: "Payment method deleted.",
        })

        fetchPaymentMethods()
      } else {
        showAlert({
          type: "warning",
          title: "Failed to delete payment method",
          description: (result.errors && result.errors[0]?.message) || "An error occurred. Please try again.",
          confirmText: "OK",
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")

      showAlert({
        type: "warning",
        title: "Failed to delete payment method",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        confirmText: "OK",
      })
    }
  }

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

        fetchPaymentMethods()
      } else {
        const errorMessage =
          result.errors && result.errors.length > 0 ? result.errors[0].message : "Failed to add payment method"

        showAlert({
          type: "warning",
          title: "Failed to add payment method",
          description: errorMessage,
          confirmText: "OK",
        })
      }
    } catch (error) {
      showAlert({
        type: "warning",
        title: "Failed to add payment method",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        confirmText: "OK",
      })
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  const handleBack = () => {
    router.push("/profile")
  }

  const handleMoreOptions = (method: PaymentMethod) => {
    setBottomSheet({
      show: true,
      paymentMethod: method,
    })
  }

  const filteredMethods = paymentMethods.filter((method) => {
    if (activeFilter === "all") return true
    return method.category === activeFilter
  })

  const bankTransfers = filteredMethods.filter((method) => method.category === "bank_transfer")
  const eWallets = filteredMethods.filter((method) => method.category === "e_wallet")

  const getBankIcon = () => <Image src="/icons/bank-transfer-icon.png" alt="Bank Transfer" width={24} height={24} />

  const getEWalletIcon = () => <Image src="/icons/ewallet-icon.png" alt="E-wallet" width={24} height={24} />

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {notification.show && (
        <CustomNotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-lg font-semibold">Payment methods</h1>
      </div>

      <div className="flex-shrink-0 bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors border ${
              activeFilter === "all"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 hover:bg-gray-50 border-black/8"
            }`}
            style={{ borderRadius: "96px" }}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("bank_transfer")}
            className={`px-4 py-2 text-sm font-medium transition-colors border ${
              activeFilter === "bank_transfer"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 hover:bg-gray-50 border-black/8"
            }`}
            style={{ borderRadius: "96px" }}
          >
            Bank Transfer
          </button>
          <button
            onClick={() => setActiveFilter("e_wallet")}
            className={`px-4 py-2 text-sm font-medium transition-colors border ${
              activeFilter === "e_wallet"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 hover:bg-gray-50 border-black/8"
            }`}
            style={{ borderRadius: "96px" }}
          >
            E-wallets
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <CustomShimmer className="h-6 w-32" />
              <div className="space-y-3">
                <CustomShimmer className="h-16 w-full rounded-lg" />
                <CustomShimmer className="h-16 w-full rounded-lg" />
              </div>
            </div>

            <div className="space-y-4">
              <CustomShimmer className="h-6 w-24" />
              <div className="space-y-3">
                <CustomShimmer className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={fetchPaymentMethods} variant="outline" className="px-6 bg-transparent">
              Try again
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {(activeFilter === "all" || activeFilter === "bank_transfer") && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Bank transfer</h2>
                {bankTransfers.length > 0 ? (
                  <div className="space-y-3">
                    {bankTransfers.map((method) => (
                      <div
                        key={method.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {getBankIcon()}
                          <div>
                            <div className="font-medium text-gray-900">Bank Name</div>
                            <div className="text-sm text-gray-500">
                              {method.details?.account?.value
                                ? maskAccountNumber(method.details.account.value)
                                : `***********${method.id.slice(-4)}`}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => handleMoreOptions(method)}>
                          <Image src="/icons/ellipsis-vertical-md.png" alt="More options" width={20} height={20} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No bank transfers added yet</p>
                )}
              </div>
            )}

            {(activeFilter === "all" || activeFilter === "e_wallet") && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">E-wallets</h2>
                {eWallets.length > 0 ? (
                  <div className="space-y-3">
                    {eWallets.map((method) => (
                      <div
                        key={method.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {getEWalletIcon()}
                          <div>
                            <div className="font-medium text-gray-900">{method.name}</div>
                            <div className="text-sm text-gray-500">
                              {method.details?.account?.value || `[${method.name}'s ID]`}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => handleMoreOptions(method)}>
                          <Image src="/icons/ellipsis-vertical-md.png" alt="More options" width={20} height={20} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No e-wallets added yet</p>
                )}
              </div>
            )}

            <div className="h-20" />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 ">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowAddPaymentMethodPanel(true)}
          className="w-full py-4 text-base font-extrabold rounded-3xl"
        >
          Add payment
        </Button>
      </div>

      <Sheet
        open={bottomSheet.show}
        onOpenChange={(open) => !open && setBottomSheet({ show: false, paymentMethod: null })}
      >
        <SheetContent side="bottom" className="h-auto">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

          <div className="space-y-4 pb-6">
            <div
              onClick={() => bottomSheet.paymentMethod && handleEditPaymentMethod(bottomSheet.paymentMethod)}
              className="w-full flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Image src="/icons/pencil.png" alt="Edit" width={20} height={20} />
              <span className="text-base font-normal text-gray-900">Edit</span>
            </div>

            <div
              onClick={() =>
                bottomSheet.paymentMethod &&
                handleDeletePaymentMethod(bottomSheet.paymentMethod.id, bottomSheet.paymentMethod.name)
              }
              className="w-full flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Image src="/icons/trash-red.png" alt="Delete" width={20} height={20} />
              <span className="text-base font-normal text-red-500">Delete</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {editPanel.show && editPanel.paymentMethod && (
        <EditPaymentMethodPanel
          paymentMethod={editPanel.paymentMethod}
          onClose={() => setEditPanel({ show: false, paymentMethod: null })}
          onSave={handleSavePaymentMethod}
          isLoading={isEditing}
        />
      )}

      {showAddPaymentMethodPanel && (
        <AddPaymentMethodPanel
          onClose={() => setShowAddPaymentMethodPanel(false)}
          onAdd={handleAddPaymentMethod}
          isLoading={isAddingPaymentMethod}
        />
      )}
    </div>
  )
}
