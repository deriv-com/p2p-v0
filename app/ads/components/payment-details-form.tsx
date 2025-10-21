"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import type { AdFormData } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getCategoryDisplayName, formatPaymentMethodName, maskAccountNumber } from "@/lib/utils"
import { ProfileAPI } from "@/services/api"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { usePaymentSelection } from "./payment-selection-context"

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

interface PaymentDetailsFormProps {
  onSubmit: (data: Partial<AdFormData>, errors?: Record<string, string>) => void
  initialData: Partial<AdFormData>
  onBottomSheetOpenChange?: (isOpen: boolean) => void
  userPaymentMethods: UserPaymentMethod[]
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
  const [selectedPMs, setSelectedPMs] = useState(tempSelectedPaymentMethods)

  const handlePaymentMethodToggle = (methodId: string) => {
    setSelectedPMs((prev) => {
      const newSelection = prev.includes(methodId)
        ? prev.filter((id) => id !== methodId)
        : prev.length < 3
          ? [...prev, methodId]
          : prev

      setTempSelectedPaymentMethods(newSelection)
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
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 space-y-4">
        {paymentMethods && <div className="text-[#000000B8]">Select up to 3</div>}
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No payment methods found</p>
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
              <span className="text-slate-1200 text-base">Add payment method</span>
            </div>
          </div>
        )}
      </div>
      <Button
        className="w-full mt-12"
        disabled={selectedPMs.length == 0}
        onClick={() => {
          setSelectedPaymentMethods(selectedPMs)
          hideAlert()
        }}
      >
        Confirm
      </Button>
    </div>
  )
}

export default function PaymentDetailsForm({
  onSubmit,
  initialData,
  onBottomSheetOpenChange,
  userPaymentMethods,
  onRefetchPaymentMethods,
}: PaymentDetailsFormProps) {
  const isMobile = useIsMobile()
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData.paymentMethods || [])
  const [instructions, setInstructions] = useState(initialData.instructions || "")
  const [touched, setTouched] = useState(false)
  const [tempSelectedPaymentMethods, setTempSelectedPaymentMethods] = useState<string[]>([])
  const [showAddPaymentPanel, setShowAddPaymentPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const { hideAlert, showAlert } = useAlertDialog()
  const { selectedPaymentMethodIds, setSelectedPaymentMethodIds } = usePaymentSelection()

  useEffect(() => {
    if (initialData.payment_method_ids && Array.isArray(initialData.payment_method_ids)) {
      const paymentMethodIds = initialData.payment_method_ids.map((id: any) => String(id))
      setSelectedPaymentMethodIds(paymentMethodIds)
    }
  }, [initialData.payment_method_ids, setSelectedPaymentMethodIds])

  const isFormValid = () => {
    return selectedPaymentMethodIds.length > 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    const formValid = isFormValid()
    const errors = !formValid ? { paymentMethods: "At least one payment method is required" } : undefined

    const paymentMethodNames = selectedPaymentMethodIds
      .map((id) => {
        const method = userPaymentMethods.find((m) => m.id === id)
        return method?.method || ""
      })
      .filter(Boolean)

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
    setTempSelectedPaymentMethods(selectedPaymentMethodIds)
    showAlert({
      title: "Payment method",
      description: (
        <PaymentSelectionContent
          paymentMethods={userPaymentMethods}
          tempSelectedPaymentMethods={tempSelectedPaymentMethods}
          setTempSelectedPaymentMethods={setTempSelectedPaymentMethods}
          setSelectedPaymentMethods={setSelectedPaymentMethodIds}
          hideAlert={hideAlert}
          handleAddPaymentMethodClick={handleAddPaymentMethodClick}
        />
      ),
    })
  }

  const handleAddPaymentMethodClick = () => {
    setShowAddPaymentPanel(true)
    hideAlert()
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
    const methods = userPaymentMethods

    if (selectedIds.length === 0) return "Select payment"
    if (selectedIds.length === 1) {
      const method = methods.find((m) => {
        const id = "id" in m ? m.id : m.method
        return id === selectedIds[0]
      })
      return method ? `${method.display_name}` : "Select payment"
    }
    return `Selected (${selectedIds.length})`
  }

  useEffect(() => {
    const paymentMethodNames = selectedPaymentMethodIds
      .map((id) => {
        const method = userPaymentMethods.find((m) => m.id === id)
        return method?.method || ""
      })
      .filter(Boolean)

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
  }, [paymentMethods, selectedPaymentMethodIds, instructions, userPaymentMethods])

  return (
    <>
      <div className="h-full flex flex-col">
        <form id="payment-details-form" onSubmit={handleSubmit} className="flex-1">
          <div className="max-w-[800px] mx-auto h-full flex flex-col">
            <div>
              <div className="mb-6">
                <div
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleShowPaymentSelection(initialData.type === "buy")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{getSelectedPaymentMethodsText()}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold leading-6 tracking-normal mb-4">
                  {initialData.type === "sell"
                    ? "Advertisers' instructions and contact details"
                    : "Instructions (Optional)"}
                </h3>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Advertisers' instructions (Optional)"
                  className="min-h-[120px] resize-none"
                  maxLength={300}
                />
                <div className="flex justify-between items-start mt-2 text-xs text-gray-500 mx-4">
                  <span>
                    This information will be visible to everyone. Don&rsquo;t share your phone number or personal
                    details.
                  </span>
                  <span>{instructions.length}/300</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

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
