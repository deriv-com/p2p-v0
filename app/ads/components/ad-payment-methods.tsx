"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CustomShimmer } from "@/app/profile/components/ui/custom-shimmer"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { ProfileAPI } from "@/services/api"
import { getCategoryDisplayName } from "@/lib/utils"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { usePaymentSelection } from "./payment-selection-context"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

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
  const { selectedPaymentMethodIds, togglePaymentMethod, setSelectedPaymentMethodIds } = usePaymentSelection()
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingMethod, setIsAddingMethod] = useState(false)
  const { showAlert, hideAlert } = useAlertDialog()
  const isMobile = useIsMobile()
  const [showAddPaymentSheet, setShowAddPaymentSheet] = useState(false)
  const [showPaymentDetailsSheet, setShowPaymentDetailsSheet] = useState(false)
  const [selectedMethodForDetails, setSelectedMethodForDetails] = useState<string | null>(null)
  const [showPaymentSelectionSheet, setShowPaymentSelectionSheet] = useState(false)
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([])

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

  const handleShowAddPaymentMethod = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

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

  const handleOpenPaymentSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTempSelectedIds([...selectedPaymentMethodIds])

    if (isMobile) {
      setShowPaymentSelectionSheet(true)
    } else {
      showAlert({
        title: "Payment method",
        description: (
          <div className="flex flex-col">
            <p className="text-sm text-gray-600 mb-6">Select up to 3</p>
            <PaymentSelectionContent />
          </div>
        ),
        showCloseButton: true,
      })
    }
  }

  const handleConfirmSelection = () => {
    setSelectedPaymentMethodIds(tempSelectedIds)
    setShowPaymentSelectionSheet(false)
    hideAlert()
  }

  const selectedMethods = paymentMethods.filter((method) => selectedPaymentMethodIds.includes(method.id))

  const getSelectedMethodsText = () => {
    if (selectedMethods.length === 0) {
      return "Select payment methods"
    }

    if (selectedMethods.length === 1) {
      return getCategoryDisplayName(selectedMethods[0].type)
    }

    if (selectedMethods.length === 2) {
      return `${getCategoryDisplayName(selectedMethods[0].type)}, ${getCategoryDisplayName(selectedMethods[1].type)}`
    }

    return `${getCategoryDisplayName(selectedMethods[0].type)}, ${getCategoryDisplayName(selectedMethods[1].type)} +1`
  }

  const getPaymentMethodDetails = (method: PaymentMethod) => {
    const displayName = getCategoryDisplayName(method.type)
    const accountNumber = method.fields?.account_number || method.fields?.bank_account_number || ""
    return `${displayName}${accountNumber ? ` - ${accountNumber}` : ""}`
  }

  const PaymentSelectionContent = () => (
    <>
      <div className="flex-1 overflow-y-auto space-y-3 mb-6">
        {paymentMethods.map((method) => {
          const isSelected = tempSelectedIds.includes(method.id)
          return (
            <div
              key={method.id}
              className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-base">{getCategoryDisplayName(method.type)}</p>
                <p className="text-sm text-gray-600 truncate">{getPaymentMethodDetails(method)}</p>
              </div>
              <Checkbox className="border-slate-1200 data-[state=checked]:!bg-slate-1200 data-[state=checked]:!border-slate-1200 rounded-[2px]" checked={isSelected} onCheckedChange={(checked) => handleCheckboxChange(method.id, !!checked)} />
            </div>
          )
        })}

        <Button
          className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg w-full hover:bg-gray-50 transition-colors"
          onClick={handleShowAddPaymentMethod}
          type="button"
          variant="outline"
        >
          <Plus className="w-6 h-6" />
          <span className="text-base font-medium">Add payment method</span>
        </Button>
      </div>

      <Button
        className="w-full h-14 rounded-full disabled:opacity-50"
        onClick={handleConfirmSelection}
        disabled={tempSelectedIds.length === 0}
        type="button"
      >
        Confirm
      </Button>
    </>
  )

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
        <Button
          variant="outline"
          className="w-full md:w-[360px] h-[56px] rounded-lg border border-gray-300 hover:border-black justify-between bg-transparent"
          onClick={handleOpenPaymentSelection}
          type="button"
        >
          <span className="truncate">{getSelectedMethodsText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </Button>

        {selectedPaymentMethodIds.length >= 3 && (
          <p className="text-amber-600 text-xs mt-2">Maximum of 3 payment methods reached</p>
        )}
      </div>

      <Sheet open={showPaymentSelectionSheet} onOpenChange={setShowPaymentSelectionSheet}>
        <SheetContent side="bottom" className="w-full h-[90vh] rounded-t-3xl">
          <div className="flex flex-col h-full">
            <SheetTitle className="text-2xl font-bold mb-2">Payment method</SheetTitle>
            <p className="text-sm text-gray-600 mb-6">Select up to 3</p>
            <PaymentSelectionContent />
          </div>
        </SheetContent>
      </Sheet>

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
