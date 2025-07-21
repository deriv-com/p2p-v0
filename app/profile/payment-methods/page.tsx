"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect, useCallback } from "react"
import { API, AUTH } from "@/lib/local-variables"
import { CustomShimmer } from "../components/ui/custom-shimmer"
import CustomStatusModal from "../components/ui/custom-status-modal"
import AddPaymentMethodPanel from "../components/add-payment-method-panel"
import EditPaymentMethodPanel from "../components/edit-payment-method-panel"
import DeleteConfirmationDialog from "../components/delete-confirmation-dialog"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MoreVertical } from "lucide-react"

interface PaymentMethod {
  id: string
  type: "bank_transfer" | "ewallet" | "other"
  display_name: string
  fields: Record<string, any>
  is_enabled: boolean
  method: string
}

type FilterType = "all" | "bank_transfer" | "ewallet"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null)
  const [statusModal, setStatusModal] = useState({
    show: false,
    type: "error" as "success" | "error",
    title: "",
    message: "",
  })

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const userId = AUTH.getUserId()
      const url = `${API.baseUrl}/users/${userId}/payment_methods`
      const headers = AUTH.getAuthHeader()

      const response = await fetch(url, {
        headers,
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()

      if (responseData && Array.isArray(responseData.data)) {
        setPaymentMethods(responseData.data)
      } else {
        setPaymentMethods([])
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load payment methods")
      setPaymentMethods([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const handleBack = () => {
    router.push("/profile")
  }

  const filteredMethods = paymentMethods.filter((method) => {
    if (activeFilter === "all") return true
    return method.type === activeFilter
  })

  const bankTransferMethods = filteredMethods.filter((method) => method.type === "bank_transfer")
  const ewalletMethods = filteredMethods.filter((method) => method.type === "ewallet")

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method)
  }

  const handleDelete = (method: PaymentMethod) => {
    setDeletingMethod(method)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingMethod) return

    try {
      const userId = AUTH.getUserId()
      const url = `${API.baseUrl}/users/${userId}/payment_methods/${deletingMethod.id}`
      const headers = AUTH.getAuthHeader()

      const response = await fetch(url, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to delete payment method: ${response.status} ${response.statusText}`)
      }

      setStatusModal({
        show: true,
        type: "success",
        title: "Success",
        message: "Payment method deleted successfully",
      })

      await fetchPaymentMethods()
    } catch (error) {
      setStatusModal({
        show: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete payment method",
      })
    } finally {
      setDeletingMethod(null)
    }
  }

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, show: false }))
  }

  const handleAddSuccess = () => {
    setShowAddPanel(false)
    fetchPaymentMethods()
    setStatusModal({
      show: true,
      type: "success",
      title: "Success",
      message: "Payment method added successfully",
    })
  }

  const handleEditSuccess = () => {
    setEditingMethod(null)
    fetchPaymentMethods()
    setStatusModal({
      show: true,
      type: "success",
      title: "Success",
      message: "Payment method updated successfully",
    })
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "bank_transfer":
        return "/icons/bank-transfer-icon.png"
      case "ewallet":
        return "/icons/ewallet-icon.png"
      default:
        return "/icons/bank-transfer-icon.png"
    }
  }

  const maskAccountNumber = (accountNumber: string): string => {
    if (!accountNumber || accountNumber.length <= 4) return accountNumber
    const lastFour = accountNumber.slice(-4)
    const masked = "*".repeat(Math.max(0, accountNumber.length - 4))
    return `${masked}${lastFour}`
  }

  const getDisplayValue = (method: PaymentMethod): string => {
    if (method.type === "bank_transfer") {
      return maskAccountNumber(method.fields?.account_number || "")
    }
    if (method.type === "ewallet") {
      return `[${method.fields?.account_id || "E-wallet's ID"}]`
    }
    return method.fields?.account_number || method.fields?.account_id || ""
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-lg font-semibold">Payment methods</h1>
      </div>

      {/* Fixed Filter Tabs */}
      <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeFilter === "all"
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "bank_transfer" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("bank_transfer")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeFilter === "bank_transfer"
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Bank Transfer
          </Button>
          <Button
            variant={activeFilter === "ewallet" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("ewallet")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeFilter === "ewallet"
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            E-wallets
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <CustomShimmer className="h-16 w-full rounded-lg" />
            <CustomShimmer className="h-16 w-full rounded-lg" />
            <CustomShimmer className="h-16 w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={fetchPaymentMethods} variant="outline" className="px-6 bg-transparent">
              Try again
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-6 pb-24">
            {/* Bank Transfer Section */}
            {(activeFilter === "all" || activeFilter === "bank_transfer") && bankTransferMethods.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Bank transfer</h2>
                {bankTransferMethods.map((method) => (
                  <Card key={method.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Image
                              src={getPaymentMethodIcon(method.type) || "/placeholder.svg"}
                              alt="Bank"
                              width={20}
                              height={20}
                              className="text-green-600"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{method.display_name || "Bank Name"}</p>
                            <p className="text-sm text-gray-600">{getDisplayValue(method)}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(method)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(method)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* E-wallets Section */}
            {(activeFilter === "all" || activeFilter === "ewallet") && ewalletMethods.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">E-wallets</h2>
                {ewalletMethods.map((method) => (
                  <Card key={method.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Image
                              src={getPaymentMethodIcon(method.type) || "/placeholder.svg"}
                              alt="E-wallet"
                              width={20}
                              height={20}
                              className="text-blue-600"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{method.display_name || "E-Wallet Name"}</p>
                            <p className="text-sm text-gray-600">{getDisplayValue(method)}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(method)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(method)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredMethods.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-gray-500 text-center mb-4">No payment methods found</p>
                <Button onClick={() => setShowAddPanel(true)} variant="outline" className="px-6 bg-transparent">
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
          className="w-full py-3 text-base font-medium bg-transparent border-gray-900 text-gray-900 hover:bg-gray-50"
        >
          Add payment
        </Button>
      </div>

      {/* Add Payment Method Panel */}
      {showAddPanel && <AddPaymentMethodPanel onClose={() => setShowAddPanel(false)} onSuccess={handleAddSuccess} />}

      {/* Edit Payment Method Panel */}
      {editingMethod && (
        <EditPaymentMethodPanel
          paymentMethod={editingMethod}
          onClose={() => setEditingMethod(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingMethod && (
        <DeleteConfirmationDialog
          isOpen={!!deletingMethod}
          onClose={() => setDeletingMethod(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete payment method"
          message={`Are you sure you want to delete ${deletingMethod.display_name}? This action cannot be undone.`}
        />
      )}

      {/* Status Modal */}
      {statusModal.show && (
        <CustomStatusModal
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onClose={closeStatusModal}
        />
      )}
    </div>
  )
}
