"use client"

import { Button } from "@/components/ui/button"
import { maskAccountNumber } from "@/lib/utils"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { API, AUTH } from "@/lib/local-variables"
import { CustomShimmer } from "./ui/custom-shimmer"
import CustomStatusModal from "./ui/custom-status-modal"
import { ProfileAPI } from "@/services/api"
import EditPaymentMethodPanel from "./edit-payment-method-panel"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import EmptyState from "@/components/empty-state"
import { useUserDataStore } from "@/stores/user-data-store"

interface PaymentMethod {
  id: string
  name: string
  type: string
  category: "bank_transfer" | "e_wallet" | "other"
  details: Record<string, any>
  instructions?: string
  isDefault?: boolean
}

export default function PaymentMethodsTab() {
  const userId = useUserDataStore((state) => state.userId)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [statusModal, setStatusModal] = useState({
    show: false,
    type: "error" as "success" | "error",
    title: "",
    message: "",
  })
  const { showDeleteDialog } = useAlertDialog()

  const [editPanel, setEditPanel] = useState({
    show: false,
    paymentMethod: null as PaymentMethod | null,
  })
  const [isEditing, setIsEditing] = useState(false)

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = `${API.baseUrl}/user-payment-methods`
      const headers = AUTH.getAuthHeader()
      const response = await fetch(url, {
        headers,
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status == 401) {
          setPaymentMethods([])
          return
        } else {
          throw new Error(`Error fetching payment methods: ${response.statusText}`)
        }
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

        return {
          id: String(method.id || ""),
          name: name,
          type: methodType,
          category: category,
          details: method.fields || {},
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
    const transformedDetails: Record<string, { display_name: string; required: boolean; value: string }> = {}

    if (method.details) {
      Object.entries(method.details).forEach(([key, value]: [string, any]) => {
        if (value && typeof value === "object" && "value" in value) {
          transformedDetails[key] = {
            display_name: value.display_name || key.charAt(0).toUpperCase() + key.slice(1),
            required: value.required || false,
            value: value.value || "",
          }
        }
      })
    }

    const cleanedMethod = {
      ...method,
      details: transformedDetails,
    }

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

      const result = await ProfileAPI.updatePaymentMethod(id, payload)

      if (result.success) {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/success-checkmark.png" alt="Success" width={24} height={24} className="text-white" />
              <span>Payment method updated.</span>
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
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

        setStatusModal({
          show: true,
          type: "error",
          title: "Failed to update payment method",
          message: errorMessage,
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")

      setStatusModal({
        show: true,
        type: "error",
        title: "Failed to update payment method",
        message: error instanceof Error ? error.message : "An error occurred. Please try again.",
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
    showDeleteDialog({
      title: `Delete ${name}?`,
      description: "Are you sure you want to delete this payment method?",
      confirmText: "Yes, delete",
      onConfirm: () => {
        confirmDeletePaymentMethod(id)
      },
    })
  }

  const confirmDeletePaymentMethod = async (id) => {
    try {
      const result = await ProfileAPI.deletePaymentMethod(id)

      if (result.success) {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/success-checkmark.png" alt="Success" width={24} height={24} className="text-white" />
              <span>Payment method deleted.</span>
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
        })
        fetchPaymentMethods()
      } else {
        setStatusModal({
          show: true,
          type: "error",
          title: "Failed to delete payment method",
          message: (result.errors && result.errors[0]?.message) || "An error occurred. Please try again.",
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")

      setStatusModal({
        show: true,
        type: "error",
        title: "Failed to delete payment method",
        message: error instanceof Error ? error.message : "An error occurred. Please try again.",
      })
    }
  }

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, show: false }))
  }

  const bankTransfers = paymentMethods.filter((method) => method.category === "bank_transfer")
  const eWallets = paymentMethods.filter((method) => method.category === "e_wallet")

  const getBankIcon = () => (
    <div className="w-10 h-10 flex items-center justify-center">
      <Image src="/icons/bank-transfer-icon.png" alt="Bank" width={24} height={24} />
    </div>
  )

  const getEWalletIcon = () => (
    <div className="w-10 h-10 flex items-center justify-center">
      <Image src="/icons/ewallet-icon-new.png" alt="E-wallet" width={24} height={24} />
    </div>
  )

  if (!userId) {
    return (<EmptyState title="No payment methods yet" description="Start adding payment methods" redirectToAds={false} />)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <CustomShimmer className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <CustomShimmer className="h-24 w-full" />
            <CustomShimmer className="h-24 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <CustomShimmer className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <CustomShimmer className="h-24 w-full" />
            <CustomShimmer className="h-24 w-full" />
            <CustomShimmer className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={fetchPaymentMethods}
          variant="primary"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded"
        >
          Try again
        </Button>
      </div>
    )
  }

  if (bankTransfers.length == 0 && eWallets.length == 0) {
    return (
      <EmptyState title="No payment methods yet" description="Start adding payment methods." redirectToAds={false} />
    )
  }

  return (
    <div>
      {bankTransfers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-base font-bold mb-4">Bank transfer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankTransfers.map((method) => (
              <Card key={method.id} variant="default" className="overflow-hidden shadow-none">
                <CardContent className="p-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      {getBankIcon()}
                      <div className="flex-1 min-w-0 text-sm ">
                        <div className="text-neutral-10">{method.details.bank_name.value}</div>
                        <div className="text-neutral-7 tracking-wide">
                          {maskAccountNumber(method.details.account.value)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto w-auto flex-shrink-0 ml-2">
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" align="center" className="w-[160px]">
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-gray-700 focus:text-gray-700 px-[16px] py-[8px] cursor-pointer"
                          onSelect={() => handleEditPaymentMethod(method)}
                        >
                          <Image src="/icons/edit-pencil-icon.png" alt="Edit" width={24} height={24} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive px-[16px] py-[8px] cursor-pointer"
                          onSelect={() => handleDeletePaymentMethod(method.id, method.name)}
                        >
                          <Image src="/icons/delete-trash-icon.png" alt="Delete" width={24} height={24} />
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
      {eWallets.length > 0 && (
        <div>
          <h3 className="text-base font-bold mb-4">E-wallets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eWallets.map((method) => (
              <Card key={method.id} variant="default" className="overflow-hidden shadow-none">
                <CardContent className="p-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      {getEWalletIcon()}
                      <div className="flex-1 min-w-0 text-sm">
                        <div className="text-neutral-10">{method.name}</div>
                        <div className="text-neutral-7">{method.details?.account?.value || `ID: ${method.id}`}</div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto w-auto flex-shrink-0 ml-2">
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" align="center" className="w-[160px]">
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-gray-700 focus:text-gray-700 px-[16px] py-[8px]"
                          onSelect={() => handleEditPaymentMethod(method)}
                        >
                          <Image src="/icons/edit-pencil-icon.png" alt="Edit" width={24} height={24} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive px-[16px] py-[8px]"
                          onSelect={() => handleDeletePaymentMethod(method.id, method.name)}
                        >
                          <Image src="/icons/delete-trash-icon.png" alt="Delete" width={24} height={24} />
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
      {editPanel.show && editPanel.paymentMethod && (
        <EditPaymentMethodPanel
          paymentMethod={editPanel.paymentMethod}
          onClose={() => setEditPanel({ show: false, paymentMethod: null })}
          onSave={handleSavePaymentMethod}
          isLoading={isEditing}
        />
      )}

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
