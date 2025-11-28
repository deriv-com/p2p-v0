"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import type { AdFormData } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { getCategoryDisplayName, formatPaymentMethodName, maskAccountNumber } from "@/lib/utils"
import { ProfileAPI } from "@/services/api"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { usePaymentSelection } from "./payment-selection-context"
import { useTranslations } from "@/lib/i18n/use-translations"

interface PaymentMethod {
  display_name: string
  method: string
  type: string
  fields: Record<string, any>
}

interface UserPaymentMethod {
  id: string
  type: string
  display_name: string
  fields: Record<string, any>
  is_enabled: number
  method: string
}

interface AvailablePaymentMethod {
  display_name: string
  type: string
  method: string
}

interface PaymentDetailsFormProps {
  onSubmit: (data: Partial<AdFormData>, errors?: Record<string, string>) => void
  initialData: Partial<AdFormData>
  onBottomSheetOpenChange?: (isOpen: boolean) => void
  userPaymentMethods: UserPaymentMethod[]
  availablePaymentMethods: AvailablePaymentMethod[]
  onRefetchPaymentMethods: () => Promise<void>
}

const PaymentSelectionContent = ({
  paymentMethods,
  tempSelectedPaymentMethods,
  setTempSelectedPaymentMethods,
  hideAlert,
  setSelectedPaymentMethods,
  handleAddPaymentMethodClick,
}: {
  paymentMethods: (UserPaymentMethod | PaymentMethod)[]
  tempSelectedPaymentMethods: string[]
  setTempSelectedPaymentMethods: (methods: string[]) => void
  hideAlert: () => void
  setSelectedPaymentMethods: (methods: string[]) => void
  handleAddPaymentMethodClick?: () => void
}) => {
  const { t } = useTranslations()
  const [selectedPMs, setSelectedPMs] = useState(tempSelectedPaymentMethods)

  useEffect(() => {
    setSelectedPMs(tempSelectedPaymentMethods)
  }, [tempSelectedPaymentMethods])

  const handlePaymentMethodToggle = (methodId: string) => {
    setSelectedPMs((prev) => {
      const newSelection = prev.includes(methodId)
        ? prev.filter((id) => id !== methodId)
        : prev.length < 3
          ? [...prev, methodId]
          : prev

      return newSelection
    })
  }

  const getMethodId = (method: UserPaymentMethod | PaymentMethod) => {
    return "id" in method ? method.id : method.method
  }

  const getMethodType = (method: UserPaymentMethod | PaymentMethod) => {
    return method.type
  }

  const getMethodDisplayName = (method: UserPaymentMethod | PaymentMethod) => {
    return method.display_name
  }

  const getMethodAccountInfo = (method: UserPaymentMethod | PaymentMethod) => {
    if ("fields" in method && method.fields?.account?.value) {
      return `${formatPaymentMethodName(method.display_name)} - ${maskAccountNumber(method.fields.account.value)}`
    }
    return formatPaymentMethodName(method.display_name)
  }

  return (
    <div className="flex flex-col h-full md:h-[60vh] md:max-h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {paymentMethods && <div className="text-[#000000B8]">{t("paymentMethod.selectUpTo3")}</div>}
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t("adForm.noPaymentMethodsFound")}</p>
          </div>
        ) : (
          paymentMethods.map((method) => {
            const methodId = getMethodId(method)
            const isUserMethod = "id" in method

            return (
              <div
                key={methodId}
                className={`bg-grayscale-500 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-color ${
                  !selectedPMs?.includes(methodId) && selectedPMs?.length >= 3
                    ? "opacity-30 cursor-not-allowed hover:bg-white"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-[6px] gap-2">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          getMethodType(method) === "bank" ? "bg-paymentMethod-bank" : "bg-paymentMethod-ewallet"
                        }`}
                      />
                      <div className="flex- flex-col">
                        <span className="text-base text-slate-1200">
                          {getCategoryDisplayName(getMethodType(method))}
                        </span>
                        <div className="font-normal text-grayscale-text-muted text-xs">
                          {isUserMethod ? getMethodAccountInfo(method) : getMethodDisplayName(method)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedPMs?.includes(methodId)}
                    onCheckedChange={() => handlePaymentMethodToggle(methodId)}
                    disabled={!selectedPMs?.includes(methodId) && selectedPMs?.length >= 3}
                    className="border-neutral-7 data-[state=checked]:bg-black data-[state=checked]:border-black w-[20px] h-[20px] rounded-sm border-[2px] disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )
          })
        )}

        {handleAddPaymentMethodClick && (
          <div
            className="bg-grayscale-500 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              handleAddPaymentMethodClick()
            }}
          >
            <div className="flex items-center">
              <Image src="/icons/plus_icon.png" alt="Plus" width={14} height={24} className="mr-2" />
              <span className="text-slate-1200 text-base">{t("paymentMethod.addPaymentMethod")}</span>
            </div>
          </div>
        )}
      </div>
      <div className="pt-4 md:py-4">
        <Button
          className="w-full"
          disabled={selectedPMs.length == 0}
          onClick={() => {
            setSelectedPaymentMethods(selectedPMs)
            hideAlert()
          }}
        >
          {t("common.confirm")}
        </Button>
      </div>
    </div>
  )
}

export default function PaymentDetailsForm({
  onSubmit,
  initialData,
  onBottomSheetOpenChange,
  userPaymentMethods,
  availablePaymentMethods,
  onRefetchPaymentMethods,
}: PaymentDetailsFormProps) {
  const { t } = useTranslations()
  const isMobile = useIsMobile()
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData.paymentMethods || [])
  const [instructions, setInstructions] = useState(initialData.instructions || "")
  const [touched, setTouched] = useState(false)
  const [tempSelectedPaymentMethods, setTempSelectedPaymentMethods] = useState<string[]>([])
  const [showAddPaymentPanel, setShowAddPaymentPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [showPaymentSelectionModal, setShowPaymentSelectionModal] = useState(false)
  const { hideAlert, showAlert } = useAlertDialog()
  const { selectedPaymentMethodIds, setSelectedPaymentMethodIds } = usePaymentSelection()

  const isFormValid = () => {
    return selectedPaymentMethodIds.length > 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    const formValid = isFormValid()
    const errors = !formValid ? { paymentMethods: "At least one payment method is required" } : undefined

    let paymentMethodNames: string[] = []

    if (initialData.type === "buy") {
      paymentMethodNames = selectedPaymentMethodIds
    } else {
      paymentMethodNames = selectedPaymentMethodIds
        .map((id) => {
          const method = userPaymentMethods.find((m) => m.id === id)
          return method?.method || ""
        })
        .filter(Boolean)
    }

    const formData = {
      id: initialData.id,
      ...(initialData.type === "sell"
        ? { payment_method_ids: selectedPaymentMethodIds }
        : { paymentMethods: paymentMethodNames }),
      instructions,
    }

    if (formValid) {
      onSubmit(formData)
    } else {
      onSubmit(formData, errors)
    }
  }

  const handleShowPaymentSelection = () => {
    if (initialData.type === "buy") {
      setShowPaymentSelectionModal(true)
    } else {
      showAlert({
        title: "Payment method",
        description: (
          <PaymentSelectionContent
            paymentMethods={userPaymentMethods}
            tempSelectedPaymentMethods={selectedPaymentMethodIds}
            setTempSelectedPaymentMethods={setSelectedPaymentMethodIds}
            setSelectedPaymentMethods={setSelectedPaymentMethodIds}
            hideAlert={hideAlert}
            handleAddPaymentMethodClick={handleAddPaymentMethodClick}
          />
        ),
      })
    }
  }

  const handleAddPaymentMethodClick = () => {
    setShowAddPaymentPanel(true)
    hideAlert()
    setShowPaymentSelectionModal(false)
  }

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingPaymentMethod(true)
      const response = await ProfileAPI.addPaymentMethod(method, fields)

      if (response.success) {
        await onRefetchPaymentMethods()
        setShowAddPaymentPanel(false)
      } else {
        let title = "Unable to add payment method"
        let description = "There was an error when adding the payment method. Please try again."

        if (response.errors.length > 0 && response.errors[0].code === "PaymentMethodDuplicate") {
          title = "Duplicate payment method"
          description = "A payment method with the same values already exists. Add a new one."
        }
        showAlert({
          title,
          description,
          confirmText: "OK",
          type: "warning",
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  const getSelectedPaymentMethodsText = () => {
    const selectedIds = selectedPaymentMethodIds
    const methods = initialData.type === "buy" ? availablePaymentMethods : userPaymentMethods

    if (selectedIds.length === 0) return t("adForm.selectPayment")
    return t("adForm.selected", { count: selectedIds.length })
  }

  useEffect(() => {
    let paymentMethodNames: string[] = []

    if (initialData.type === "buy") {
      paymentMethodNames = selectedPaymentMethodIds
    } else {
      paymentMethodNames = selectedPaymentMethodIds
        .map((id) => {
          const method = userPaymentMethods.find((m) => m.id === id)
          return method?.method || ""
        })
        .filter(Boolean)
    }

    const event = new CustomEvent("paymentFormValidationChange", {
      detail: {
        isValid: isFormValid(),
        formData: {
          payment_method_ids: selectedPaymentMethodIds,
          paymentMethods: paymentMethodNames,
          instructions,
        },
      },
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [paymentMethods, selectedPaymentMethodIds, instructions, userPaymentMethods, initialData.type])

  const handleClosePaymentSelection = () => {
    setShowPaymentSelectionModal(false)
  }

  const handleConfirmPaymentSelection = (methods: string[]) => {
    setSelectedPaymentMethodIds(methods)
    setShowPaymentSelectionModal(false)
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <form id="payment-details-form" onSubmit={handleSubmit} className="flex-1">
          <div className="max-w-[800px] mx-auto h-full flex flex-col">
            <div>
              <div className="mb-6">
                <Button
                  variant="outline"
                  className="w-full justify-between px-4 rounded-lg bg-transparent border-input hover:bg-transparent max-h-none h-[56px]"
                  onClick={() => handleShowPaymentSelection()}
                  type="button"
                >
                  <span className="text-left font-normal text-base text-black/[0.72]">
                    {getSelectedPaymentMethodsText()}
                  </span>
                  <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
                </Button>
              </div>

              <div>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={t("adForm.instructions")}
                  className="min-h-[120px] resize-none"
                  maxLength={300}
                />
                <div className="flex justify-between items-start mt-2 text-xs text-gray-500 mx-4">
                  <span>{t("adForm.instructionsDisclaimer")}</span>
                  <span>{instructions.length}/300</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {isMobile ? (
        <Drawer open={showPaymentSelectionModal} onOpenChange={setShowPaymentSelectionModal}>
          <DrawerContent className="px-6 pb-6">
            <DrawerHeader className="px-0">
              <DrawerTitle>{t("paymentMethod.title")}</DrawerTitle>
            </DrawerHeader>
            <PaymentSelectionContent
              paymentMethods={initialData.type === "buy" ? availablePaymentMethods : userPaymentMethods}
              tempSelectedPaymentMethods={selectedPaymentMethodIds}
              setTempSelectedPaymentMethods={setSelectedPaymentMethodIds}
              setSelectedPaymentMethods={handleConfirmPaymentSelection}
              hideAlert={handleClosePaymentSelection}
              handleAddPaymentMethodClick={handleAddPaymentMethodClick}
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showPaymentSelectionModal} onOpenChange={setShowPaymentSelectionModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("paymentMethod.title")}</DialogTitle>
            </DialogHeader>
            <PaymentSelectionContent
              paymentMethods={initialData.type === "buy" ? availablePaymentMethods : userPaymentMethods}
              tempSelectedPaymentMethods={selectedPaymentMethodIds}
              setTempSelectedPaymentMethods={setSelectedPaymentMethodIds}
              setSelectedPaymentMethods={handleConfirmPaymentSelection}
              hideAlert={handleClosePaymentSelection}
              handleAddPaymentMethodClick={handleAddPaymentMethodClick}
            />
          </DialogContent>
        </Dialog>
      )}

      {showAddPaymentPanel && (
        <AddPaymentMethodPanel
          onAdd={handleAddPaymentMethod}
          isLoading={isAddingPaymentMethod}
          onClose={() => setShowAddPaymentPanel(false)}
        />
      )}
    </>
  )
}
