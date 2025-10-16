"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CustomShimmer } from "@/app/profile/components/ui/custom-shimmer"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { ProfileAPI } from "@/services/api"
import { getCategoryDisplayName, getMethodDisplayDetails, getPaymentMethodColour } from "@/lib/utils"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { usePaymentSelection } from "./payment-selection-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const { selectedPaymentMethodIds, togglePaymentMethod } = usePaymentSelection()
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingMethod, setIsAddingMethod] = useState(false)
  const { showAlert, hideAlert } = useAlertDialog()
  const isMobile = useIsMobile()
  const [showAddPaymentSheet, setShowAddPaymentSheet] = useState(false)
  const [showPaymentDetailsSheet, setShowPaymentDetailsSheet] = useState(false)
  const [selectedMethodForDetails, setSelectedMethodForDetails] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const data = await ProfileAPI.getUserPaymentMethods()
        setPaymentMethods(data)
      } catch (error) {
        setPaymentMethods([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  const handleCheckboxChange = (methodId: number, checked: boolean) => {
    if (checked && selectedPaymentMethodIds.length >= 3) {
      return
    }

    togglePaymentMethod(methodId)
  }

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingMethod(true)
      const result = await ProfileAPI.addPaymentMethod(method, fields)

      if (result.success) {
        const data = await ProfileAPI.getUserPaymentMethods()
        setPaymentMethods(data)

        if (isMobile) {
          setShowPaymentDetailsSheet(false)
          setShowAddPaymentSheet(false)
        } else {
          hideAlert()
        }
      } else {
        let title = "Unable to add payment method"
        let description = "There was an error when adding the payment method. Please try again."

        if (result.errors.length > 0 && result.errors[0].code === "PaymentMethodDuplicate") {
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
    } finally {
      setIsAddingMethod(false)
    }
  }

  const handleShowAddPaymentMethod = () => {
    if (isMobile) {
      setShowAddPaymentSheet(true)
    } else {
      showAlert({
        title: "Select a payment method",
        description: (
          <AddPaymentMethodPanel
            onAdd={handleAddPaymentMethod}
            isLoading={isAddingMethod}
            onMethodSelect={(method) => {
              showAlert({
                title: "Add payment details",
                description: (
                  <AddPaymentMethodPanel
                    onAdd={handleAddPaymentMethod}
                    isLoading={isAddingMethod}
                    selectedMethod={method}
                    onBack={() => handleShowAddPaymentMethod()}
                  />
                ),
                showCloseButton: true,
              })
            }}
          />
        ),
        showCloseButton: true,
      })
    }
  }

  const handleCheckboxToggle = (methodId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isSelected = selectedPaymentMethodIds.includes(methodId)
    if (!isSelected && selectedPaymentMethodIds.length >= 3) {
      return
    }

    togglePaymentMethod(methodId)
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

  const selectedMethods = paymentMethods.filter((method) => selectedPaymentMethodIds.includes(method.id))

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select payment method</h3>
        <p className="text-gray-600 mb-4">You can select up to 3 payment methods</p>

        <Button
          variant="outline"
          className="w-full md:w-[360px] h-[56px] rounded-lg border border-gray-300 hover:border-black justify-between bg-transparent"
          onClick={handleShowAddPaymentMethod}
        >
          <span>
            {selectedPaymentMethodIds.length > 0
              ? `Selected (${selectedPaymentMethodIds.length})`
              : "Select payment methods"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        {selectedMethods.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedMethods.map((method) => {
              const displayDetails = getMethodDisplayDetails(method)
              return (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className={`${getPaymentMethodColour(method.type)} rounded-full w-3 h-3`} />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-sm">{getCategoryDisplayName(method.type)}</span>
                    <span className="text-xs text-gray-600">{displayDetails.primary}</span>
                  </div>
                  <button
                    onClick={() => togglePaymentMethod(method.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {paymentMethods.length === 0 && <p className="text-gray-500 italic mt-4">No payment methods are added yet</p>}

        {selectedPaymentMethodIds.length >= 3 && (
          <p className="text-amber-600 text-xs mt-2">Maximum of 3 payment methods reached</p>
        )}
      </div>

      <Sheet open={showAddPaymentSheet} onOpenChange={setShowAddPaymentSheet}>
        <SheetContent side="right" className="w-full h-full">
          <div className="mt-4 h-[calc(100%-20px)] overflow-y-auto">
            <div className="my-4 font-bold text-xl">Select a payment method</div>
            <AddPaymentMethodPanel
              onAdd={handleAddPaymentMethod}
              isLoading={isAddingMethod}
              onMethodSelect={(method) => {
                setSelectedMethodForDetails(method)
                setShowAddPaymentSheet(false)
                setShowPaymentDetailsSheet(true)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showPaymentDetailsSheet} onOpenChange={setShowPaymentDetailsSheet}>
        <SheetContent side="right" className="w-full h-full">
          <div className="mt-4 h-[calc(100%-20px)] overflow-y-auto">
            <div className="my-4 font-bold text-xl">Add payment details</div>
            <AddPaymentMethodPanel
              onAdd={handleAddPaymentMethod}
              isLoading={isAddingMethod}
              selectedMethod={selectedMethodForDetails}
              onBack={() => {
                setShowPaymentDetailsSheet(false)
                setShowAddPaymentSheet(true)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default AdPaymentMethods
