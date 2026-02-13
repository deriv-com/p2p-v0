"use client"

import { Button } from "@/components/ui/button"
import { maskAccountNumber } from "@/lib/utils"
import Image from "next/image"
import { useState, useMemo, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CustomShimmer } from "./ui/custom-shimmer"
import EditPaymentMethodPanel from "./edit-payment-method-panel"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import EmptyState from "@/components/empty-state"
import { useUserDataStore } from "@/stores/user-data-store"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useUserPaymentMethods, useUpdatePaymentMethod, useDeletePaymentMethod } from "@/hooks/use-api-queries"

interface PaymentMethod {
  id: string
  name: string
  type: string
  category: "bank_transfer" | "e_wallet" | "other"
  details: Record<string, any>
  instructions?: string
  isDefault?: boolean
}

interface PaymentMethodsTabProps {
  onAddPaymentMethod?: () => void
  onPaymentMethodsCountChange?: (count: number) => void
}

export default function PaymentMethodsTab({ onAddPaymentMethod, onPaymentMethodsCountChange }: PaymentMethodsTabProps) {
  const { t } = useTranslations()
  const userId = useUserDataStore((state) => state.userId)
  const { toast } = useToast()
  const { showDeleteDialog, showAlert } = useAlertDialog()

  const [editPanel, setEditPanel] = useState({
    show: false,
    paymentMethod: null as PaymentMethod | null,
  })

  // Use React Query hooks
  const { data: methodsResponse, isLoading, error, refetch } = useUserPaymentMethods(!!userId)
  const updatePaymentMethod = useUpdatePaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()

  // Transform API response to PaymentMethod format
  const paymentMethods = useMemo(() => {
    if (!methodsResponse?.data) return []

    return methodsResponse.data.map((method: any) => {
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
  }, [methodsResponse])

  // Notify parent of count changes
  useEffect(() => {
    onPaymentMethodsCountChange?.(paymentMethods.length)
  }, [paymentMethods.length, onPaymentMethodsCountChange])

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
      const paymentMethod = paymentMethods.find((m) => m.id === id)

      const payload = {
        method: paymentMethod.type,
        fields: { ...fields },
      }

      await updatePaymentMethod.mutateAsync({ id, ...payload })

      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
            <span>{t("profile.paymentMethodUpdated")}</span>
          </div>
        ),
        className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
        duration: 2500,
      })

      setEditPanel({
        show: false,
        paymentMethod: null,
      })
    } catch (error: any) {
      let errorMessage = t("profile.unableToUpdatePaymentMethod")

      if (error.errors && error.errors.length > 0) {
        const errorCode = error.errors[0].code

        if (errorCode === "PaymentMethodInUseByOrder") {
          errorMessage = t("profile.paymentMethodInUseByOrder")
        } else if (error.errors[0].message) {
          errorMessage = error.errors[0].message
        }
      }

      showAlert({
        title: t("profile.cannotUpdatePaymentMethod"),
        description: errorMessage,
        confirmText: t("orderDetails.gotIt"),
        type: "error",
      })
    }
  }

  const handleDeletePaymentMethod = (id: string, name: string) => {
    showDeleteDialog({
      title: t("profile.deletePaymentMethodTitle"),
      description: t("profile.deletePaymentMethodDescription"),
      cancelText: t("common.no"),
      confirmText: t("common.yes") + ", " + t("common.delete").toLowerCase(),
      onConfirm: () => {
        confirmDeletePaymentMethod(id)
      },
    })
  }

  const confirmDeletePaymentMethod = async (id: string) => {
    try {
      await deletePaymentMethod.mutateAsync(id)

      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
            <span>{t("profile.paymentMethodDeleted")}</span>
          </div>
        ),
        className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
        duration: 2500,
      })
    } catch (error: any) {
      let errorMessage = t("profile.unableToDeletePaymentMethod")

      if (error.errors && error.errors.length > 0) {
        const errorCode = error.errors[0].code

        if (errorCode === "PaymentMethodInUseByOrder") {
          errorMessage = t("profile.paymentMethodLinkedToOrder")
        } else if (errorCode === "PaymentMethodInUseByAdvert") {
          errorMessage = t("profile.paymentMethodLinkedToAd")
        } else if (error.errors[0].message) {
          errorMessage = error.errors[0].message
        }
      }

      showAlert({
        title: t("profile.cannotDeletePaymentMethod"),
        description: errorMessage,
        confirmText: t("orderDetails.gotIt"),
        type: "error",
      })
    }
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
    return (
      <EmptyState
        title={t("profile.noPaymentMethodsYet")}
        description={t("profile.startAddingPaymentMethods")}
        redirectToAds={false}
        onAddPaymentMethod={onAddPaymentMethod}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <CustomShimmer className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            <CustomShimmer className="h-24 w-full" />
            <CustomShimmer className="h-24 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <CustomShimmer className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            <CustomShimmer className="h-24 w-full" />
            <CustomShimmer className="h-24 w-full" />
            <CustomShimmer className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const errorMessage = error instanceof Error ? error.message : "Failed to load payment methods"
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-red-500 mb-4">{errorMessage}</p>
        <Button
          onClick={() => refetch()}
          variant="primary"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded"
        >
          {t("profile.tryAgain")}
        </Button>
      </div>
    )
  }

  if (bankTransfers.length == 0 && eWallets.length == 0) {
    return (
      <EmptyState
        title={t("profile.noPaymentMethodsYet")}
        description={t("profile.startAddingPaymentMethods")}
        redirectToAds={false}
        onAddPaymentMethod={onAddPaymentMethod}
      />
    )
  }

  return (
    <div>
      {bankTransfers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-base font-bold mb-4">{t("paymentMethod.bankTransfers")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankTransfers.map((method) => (
              <Card
                key={method.id}
                variant="default"
                className="overflow-hidden shadow-none border-0 border-b rounded-none"
              >
                <CardContent className="p-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      {getBankIcon()}
                      <div className="flex-1 min-w-0 text-sm ">
                        <div className="text-neutral-10">{method.details.bank_name.value}</div>
                        <div className="text-neutral-7 tracking-wide text-xs">
                          {maskAccountNumber(method.details.account.value)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto w-auto flex-shrink-0 ml-2">
                          <Image src="/icons/vertical.svg" alt="Options" width={24} height={24} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" align="center" className="w-[160px]">
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-gray-700 focus:text-gray-700 px-[16px] py-[8px] cursor-pointer"
                          onSelect={() => handleEditPaymentMethod(method)}
                        >
                          <Image src="/icons/edit-pencil-icon.png" alt="Edit" width={24} height={24} />
                          {t("profile.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive px-[16px] py-[8px]"
                          onSelect={() => handleDeletePaymentMethod(method.id, method.name)}
                        >
                          <Image src="/icons/delete-trash-icon.png" alt="Delete" width={24} height={24} />
                          {t("profile.delete")}
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
          <h3 className="text-base font-bold mb-4">{t("paymentMethod.eWallets")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eWallets.map((method) => (
              <Card
                key={method.id}
                variant="default"
                className="overflow-hidden shadow-none border-0 border-b rounded-none"
              >
                <CardContent className="p-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      {getEWalletIcon()}
                      <div className="flex-1 min-w-0 text-sm">
                        <div className="text-neutral-10">{method.name}</div>
                        <div className="text-neutral-7 text-xs">
                          {method.details?.account?.value || `ID: ${method.id}`}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto w-auto flex-shrink-0 ml-2">
                          <Image src="/icons/vertical.svg" alt="Options" width={24} height={24} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" align="center" className="w-[160px]">
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-gray-700 focus:text-gray-700 px-[16px] py-[8px]"
                          onSelect={() => handleEditPaymentMethod(method)}
                        >
                          <Image src="/icons/edit-pencil-icon.png" alt="Edit" width={24} height={24} />
                          {t("profile.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive px-[16px] py-[8px]"
                          onSelect={() => handleDeletePaymentMethod(method.id, method.name)}
                        >
                          <Image src="/icons/delete-trash-icon.png" alt="Delete" width={24} height={24} />
                          {t("profile.delete")}
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
          isLoading={updatePaymentMethod.isPending}
        />
      )}
    </div>
  )
}
