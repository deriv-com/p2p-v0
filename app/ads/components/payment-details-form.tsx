"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import type { AdFormData } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Check, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import PaymentMethodBottomSheet from "./payment-method-bottom-sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getCategoryDisplayName, formatPaymentMethodName, maskAccountNumber } from "@/lib/utils"
import { ProfileAPI } from "@/services/api"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

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
}

const PaymentSelectionContent = ({
  userPaymentMethods,
  tempSelectedPaymentMethods,
  setTempSelectedPaymentMethods,
  hideAlert,
  setSelectedPaymentMethods,
  handleAddPaymentMethodClick,
}: {
  userPaymentMethods: UserPaymentMethod[]
  tempSelectedPaymentMethods: string[]
  setTempSelectedPaymentMethods: (methods: string[]) => void
  hideAlert: () => void
  setSelectedPaymentMethods: (methods: string[]) => void
  handleAddPaymentMethodClick: () => void
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

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 space-y-4">
        {userPaymentMethods && <div className="text-[#000000B8]">Select up to 3</div>}
        {userPaymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No payment methods found</p>
            <p className="text-sm text-gray-500">Add a payment method to continue</p>
          </div>
        ) : (
          userPaymentMethods.map((method) => (
            <div
              key={method.id}
              className={` bg-grayscale-500 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-color ${
                !selectedPMs?.includes(method.id) && selectedPMs?.length >= 3
                  ? "opacity-30 cursor-not-allowed hover:bg-white"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-[6px] gap-2">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        method.type === "bank" ? "bg-paymentMethod-bank" : "bg-paymentMethod-ewallet"
                      }`}
                    />
                    <div className="flex- flex-col">
                      <span className="text-base text-slate-1200">{getCategoryDisplayName(method.type)}</span>
                      <div className="font-normal text-grayscale-text-muted text-xs">{`${formatPaymentMethodName(method.display_name)} - ${maskAccountNumber(method.fields.account.value)}`}</div>
                    </div>
                  </div>
                </div>
                <Checkbox
                  checked={selectedPMs?.includes(method.id)}
                  onCheckedChange={() => handlePaymentMethodToggle(method.id)}
                  disabled={!selectedPMs?.includes(method.id) && selectedPMs?.length >= 3}
                  className="border-neutral-7 data-[state=checked]:bg-black data-[state=checked]:border-black w-[20px] h-[20px] rounded-sm border-[2px] disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          ))
        )}

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
}: PaymentDetailsFormProps) {
  const isMobile = useIsMobile()
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData.paymentMethods || [])
  const [instructions, setInstructions] = useState(initialData.instructions || "")
  const [touched, setTouched] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([])

  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<string[]>([])
  const [userPaymentMethods, setUserPaymentMethods] = useState<UserPaymentMethod[]>([])
  const [tempSelectedPaymentMethods, setTempSelectedPaymentMethods] = useState<string[]>([])
  const [showAddPaymentPanel, setShowAddPaymentPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const { hideAlert, showAlert } = useAlertDialog()

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/available-payment-methods`, {
          headers,
          credentials: "include",
        })
        const responseData = await response.json()

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setAvailablePaymentMethods(responseData.data)
        } else {
          setAvailablePaymentMethods([])
        }
      } catch {
        setAvailablePaymentMethods([])
      }
    }

    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    if (initialData.type === "sell") {
      fetchUserPaymentMethods()
    }
  }, [initialData.type])

  const fetchUserPaymentMethods = async () => {
    try {
      const response = await ProfileAPI.getUserPaymentMethods()

      if (response.error) {
        return
      }

      setUserPaymentMethods(response || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    }
  }

  const filteredPaymentMethods = availablePaymentMethods.filter((method) =>
    method.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const MAX_PAYMENT_METHODS = 3

  const isFormValid = () => {
    if (initialData.type === "sell") {
      return selectedPaymentMethodIds.length > 0
    }
    return paymentMethods.length > 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    const formValid = isFormValid()
    const errors = !formValid ? { paymentMethods: "At least one payment method is required" } : undefined

    const formData = {
      id: initialData.id,
      paymentMethods,
      payment_method_ids: initialData.type === "sell" ? selectedPaymentMethodIds : [],
      instructions,
    }

    if (formValid) {
      onSubmit(formData)
    } else {
      onSubmit(formData, errors)
    }
  }

  const togglePaymentMethod = (methodId: string) => {
    setTouched(true)

    if (paymentMethods.includes(methodId)) {
      setPaymentMethods(paymentMethods.filter((m) => m !== methodId))
    } else if (paymentMethods.length < MAX_PAYMENT_METHODS) {
      setPaymentMethods([...paymentMethods, methodId])
    }
  }

  const handleSelectPaymentMethods = (methods: string[]) => {
    setTouched(true)
    setPaymentMethods(methods)
  }

  const handleOpenBottomSheet = () => {
    setBottomSheetOpen(true)
    if (onBottomSheetOpenChange) {
      onBottomSheetOpenChange(true)
    }
  }

  const handleCloseBottomSheet = () => {
    setBottomSheetOpen(false)
    if (onBottomSheetOpenChange) {
      onBottomSheetOpenChange(false)
    }
  }

  const isMethodSelected = (methodId: string) => paymentMethods.includes(methodId)
  const isMaxReached = paymentMethods.length >= MAX_PAYMENT_METHODS

  const handleShowPaymentSelection = () => {
    setTempSelectedPaymentMethods(selectedPaymentMethodIds)
    showAlert({
      title: "Payment method",
      description: (
        <PaymentSelectionContent
          userPaymentMethods={userPaymentMethods}
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
        await fetchUserPaymentMethods()
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
    if (selectedPaymentMethodIds.length === 0) return "Select payment"
    if (selectedPaymentMethodIds.length === 1) {
      const method = userPaymentMethods.find((m) => m.id === selectedPaymentMethodIds[0])
      return method ? `${method.display_name}` : "Select payment"
    }
    return `Selected (${selectedPaymentMethodIds.length})`
  }

  useEffect(() => {
    const event = new CustomEvent("paymentFormValidationChange", {
      detail: {
        isValid: isFormValid(),
        formData: {
          paymentMethods,
          payment_method_ids: selectedPaymentMethodIds,
          instructions,
        },
      },
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [paymentMethods, selectedPaymentMethodIds, instructions])

  return (
    <>
      <div className="h-full flex flex-col">
        <form id="payment-details-form" onSubmit={handleSubmit} className="flex-1">
          <div className="max-w-[800px] mx-auto h-full flex flex-col">
            <div>
              {initialData.type === "buy" && (
                <div>
                  <div className="mb-6">
                    {isMobile ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full h-[56px] rounded-[8px] border border-[1px] gap-[8px] px-[16px] justify-between text-left ${
                            bottomSheetOpen ? "border-black" : "border-gray-300"
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleOpenBottomSheet()
                          }}
                        >
                          <span className="font-normal text-base">
                            {paymentMethods.length > 0 ? `Selected (${paymentMethods.length})` : "Payment method"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-70 ml-auto" />
                        </Button>

                        <PaymentMethodBottomSheet
                          isOpen={bottomSheetOpen}
                          onClose={handleCloseBottomSheet}
                          onSelect={(methods) => {
                            handleSelectPaymentMethods(methods)
                            handleCloseBottomSheet()
                          }}
                          selectedMethods={paymentMethods}
                          availableMethods={availablePaymentMethods}
                          maxSelections={MAX_PAYMENT_METHODS}
                        />
                      </>
                    ) : (
                      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger
                          className={`w-full md:w-[360px] h-[56px] rounded-lg border ${
                            dropdownOpen ? "border-black" : "border-gray-300"
                          } justify-between text-left focus:outline-none focus-visible:outline-none focus:ring-0 relative flex items-center px-4`}
                        >
                          {dropdownOpen ? (
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm text-black">Payment method</span>
                              <span className="text-gray-400 text-sm">{`Selected (${paymentMethods.length})`}</span>
                            </div>
                          ) : (
                            <span className="font-normal text-base">
                              {paymentMethods.length > 0 ? `Selected (${paymentMethods.length})` : "Payment method"}
                            </span>
                          )}
                          {dropdownOpen ? (
                            <ChevronUp className="h-4 w-4 opacity-70 absolute top-4 right-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4 opacity-70 ml-auto" />
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[360px] min-w-[360px] shadow-dropdown">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="relative p-1"
                          >
                            <Image
                              src="/icons/search-icon-custom.png"
                              alt="Search"
                              width={24}
                              height={24}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            />
                            <Input
                              placeholder="Search"
                              value={searchQuery}
                              onChange={(e) => {
                                e.stopPropagation()
                                setSearchQuery(e.target.value)
                              }}
                              className="text-base pl-10 border-gray-200 focus:border-black focus:ring-0"
                              onKeyDown={(e) => e.stopPropagation()}
                              variant="secondary"
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="off"
                            />
                          </div>
                          {filteredPaymentMethods.map((method) => (
                            <DropdownMenuItem
                              key={method.method}
                              onSelect={(e) => {
                                e.preventDefault()
                                togglePaymentMethod(method.method)
                              }}
                              disabled={!isMethodSelected(method.method) && isMaxReached}
                              className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${
                                !isMethodSelected(method.method) && isMaxReached ? "opacity-50" : ""
                              }`}
                            >
                              <div
                                className={`w-4 h-4 flex items-center justify-center rounded border ${
                                  isMethodSelected(method.method) ? "bg-black border-black" : "border-gray-300"
                                }`}
                              >
                                {isMethodSelected(method.method) && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-base">{method.display_name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {touched && paymentMethods.length === 0 && initialData.type === "buy" && (
                      <p className="text-destructive text-xs mt-1">Payment method is required</p>
                    )}

                    {isMaxReached && (
                      <p className="text-amber-600 text-xs mt-1">
                        Maximum of {MAX_PAYMENT_METHODS} payment methods reached
                      </p>
                    )}
                  </div>
                </div>
              )}

              {initialData.type === "sell" && (
                <div className="mb-6">
                  <div
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleShowPaymentSelection}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{getSelectedPaymentMethodsText()}</span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {touched && selectedPaymentMethodIds.length === 0 && initialData.type === "sell" && (
                    <p className="text-destructive text-xs mt-1">At least one payment method is required</p>
                  )}
                  {selectedPaymentMethodIds.length >= MAX_PAYMENT_METHODS && (
                    <p className="text-amber-600 text-xs mt-1">
                      Maximum of {MAX_PAYMENT_METHODS} payment methods reached
                    </p>
                  )}
                </div>
              )}

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
