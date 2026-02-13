"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomShimmer } from "@/app/profile/components/ui/custom-shimmer"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { getCategoryDisplayName, getMethodDisplayDetails, getPaymentMethodColour } from "@/lib/utils"
import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { usePaymentSelection } from "./payment-selection-context"
import { useAddPaymentMethod, useUserPaymentMethods } from "@/hooks/use-api-queries"

interface PaymentMethod {
  id: number
  method: string
  type: string
  display_name: string
  fields: Record<string, any>
  created_at?: number
  is_default?: boolean
}

const AdPaymentMethods = () => {
  const { selectedPaymentMethodIds, togglePaymentMethod } = usePaymentSelection()
  const { showAlert } = useAlertDialog()
  const [showAddPaymentPanel, setShowAddPaymentPanel] = useState(false)

  // Use React Query hooks
  const addPaymentMethod = useAddPaymentMethod()
  const { data: paymentMethodsResponse, isLoading } = useUserPaymentMethods(true)

  // Transform API response to PaymentMethod format
  const paymentMethods = useMemo(() => {
    if (!paymentMethodsResponse?.data) return []
    return paymentMethodsResponse.data
  }, [paymentMethodsResponse?.data])

  const handleCheckboxChange = (methodId: number, checked: boolean) => {
    if (checked && selectedPaymentMethodIds.length >= 3) {
      return
    }

    togglePaymentMethod(methodId)
  }

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      await addPaymentMethod.mutateAsync({ method, fields })
      setShowAddPaymentPanel(false)
    } catch (error: any) {
      let title = "Unable to add payment method"
      let description = "There was an error when adding the payment method. Please try again."

      if (error.errors && error.errors.length > 0 && error.errors[0].code === "PaymentMethodDuplicate") {
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
  }

  const handleShowAddPaymentMethod = () => {
    setShowAddPaymentPanel(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <CustomShimmer className="h-6 w-48" />
          <CustomShimmer className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CustomShimmer className="h-24 w-full" />
          <CustomShimmer className="h-24 w-full" />
          <CustomShimmer className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select payment method</h3>
        <p className="text-gray-600 mb-4">You can select up to 3 payment methods</p>

        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
          <div className="flex gap-4 overflow-x-auto pb-2 md:contents">
            {paymentMethods.map((method) => {
              const isSelected = selectedPaymentMethodIds.includes(method.id)
              const displayDetails = getMethodDisplayDetails(method)
              const isMaxReached = selectedPaymentMethodIds.length >= 3
              const isDisabled = isMaxReached && !isSelected

              return (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all duration-200 flex-shrink-0 w-64 md:w-auto ${
                    isSelected ? "border rounded-lg border-slate-1200" : "border-0"
                  } ${
                    isDisabled ? "bg-gray-100 opacity-50 cursor-not-allowed" : "bg-grayscale-300"
                  } hover:shadow-md`}
                  onClick={() => !isDisabled && handleCheckboxChange(method.id, !isSelected)}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 ml-2">
                        <div className={`${getPaymentMethodColour(method.type)} rounded-full w-3 h-3`} />
                        <span className="font-bold tex-sm text-gray-700">{getCategoryDisplayName(method.type)}</span>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleCheckboxChange(method.id, !!checked)}
                        disabled={isDisabled}
                        className="border-slate-1200 data-[state=checked]:!bg-slate-1200 data-[state=checked]:!border-slate-1200 rounded-[2px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm tracking-wide text-neutral-10">{displayDetails.primary}</div>
                      <div className="text-sm text-neutral-7">{displayDetails.secondary}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            <Card
              className="cursor-pointer transition-all duration-200 hover:shadow-md flex-shrink-0 w-64 md:w-auto border border-grayscale-400 bg-white"
              onClick={handleShowAddPaymentMethod}
            >
              <CardContent className="p-4 h-full flex items-center justify-center">
                <div className="text-center">
                  <Image
                    src="/icons/plus_icon.png"
                    alt="Add payment method"
                    width={14}
                    height={24}
                    className="mx-auto mb-2"
                  />
                  <p className="text-sm text-neutral-10">Add payment method</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {paymentMethods.length === 0 && <p className="text-gray-500 italic">No payment methods are added yet</p>}
      </div>

      {showAddPaymentPanel && (
        <AddPaymentMethodPanel
          onAdd={handleAddPaymentMethod}
          isLoading={addPaymentMethod.isPending}
          onClose={() => setShowAddPaymentPanel(false)}
        />
      )}
    </>
  )
}

export default AdPaymentMethods
