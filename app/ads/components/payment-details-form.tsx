"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { AdFormData } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import PaymentMethodBottomSheet from "./payment-method-bottom-sheet"
import { Button } from "@/components/ui/button"
import { API, AUTH } from "@/lib/local-variables"
import AdPaymentMethods from "./ad-payment-methods"

interface PaymentMethod {
  display_name: string
  method: string
  type: string
  fields: Record<string, any>
}

interface PaymentDetailsFormProps {
  onSubmit: (data: Partial<AdFormData>, errors?: Record<string, string>) => void
  initialData: Partial<AdFormData>
  onBottomSheetOpenChange?: (isOpen: boolean) => void
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

  console.log("PaymentDetailsForm render - paymentMethods:", paymentMethods)
  console.log("PaymentDetailsForm render - initialData.type:", initialData.type)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const headers = AUTH.getAuthHeader()
        const response = await fetch(`${API.baseUrl}${API.endpoints.availablePaymentMethods}`, {
          headers,
        })
        const responseData = await response.json()

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          console.log("Available payment methods fetched:", responseData.data)
          setAvailablePaymentMethods(responseData.data)
        } else {
          setAvailablePaymentMethods([])
        }
      } catch (error) {
        console.log("Error fetching payment methods:", error)
        setAvailablePaymentMethods([])
      }
    }

    fetchPaymentMethods()
  }, [])

  const filteredPaymentMethods = availablePaymentMethods.filter((method) =>
    method.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const MAX_PAYMENT_METHODS = 3

  const isFormValid = () => {
    if (initialData.type === "sell") {
      // For sell ads, check if payment methods are selected via the AdPaymentMethods component
      const selectedPaymentMethodIds = (window as any).adPaymentMethodIds || []
      console.log("Sell ad validation - selectedPaymentMethodIds:", selectedPaymentMethodIds)
      return selectedPaymentMethodIds.length > 0
    }
    // For buy ads, check the paymentMethods state
    console.log("Buy ad validation - paymentMethods.length:", paymentMethods.length)
    return paymentMethods.length > 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    console.log("PaymentDetailsForm handleSubmit called")
    console.log("Current paymentMethods state:", paymentMethods)
    console.log("Current instructions:", instructions)
    console.log("Ad type:", initialData.type)

    const formValid = isFormValid()
    console.log("Form validation result:", formValid)

    const errors = !formValid ? { paymentMethods: "At least one payment method is required" } : undefined

    const selectedPaymentMethodIds = initialData.type === "sell" ? (window as any).adPaymentMethodIds || [] : []
    console.log("Selected payment method IDs for submission:", selectedPaymentMethodIds)

    const formData = {
      paymentMethods,
      payment_method_ids: selectedPaymentMethodIds,
      instructions,
    }

    console.log("Submitting form data:", formData)
    console.log("Submitting errors:", errors)

    if (formValid) {
      onSubmit(formData)
    } else {
      onSubmit(formData, errors)
    }
  }

  const togglePaymentMethod = (methodId: string) => {
    console.log("togglePaymentMethod called with:", methodId)
    setTouched(true)

    if (paymentMethods.includes(methodId)) {
      const newMethods = paymentMethods.filter((m) => m !== methodId)
      console.log("Removing method, new array:", newMethods)
      setPaymentMethods(newMethods)
    } else if (paymentMethods.length < MAX_PAYMENT_METHODS) {
      const newMethods = [...paymentMethods, methodId]
      console.log("Adding method, new array:", newMethods)
      setPaymentMethods(newMethods)
    }
  }

  const handleSelectPaymentMethods = (methods: string[]) => {
    setTouched(true)
    setPaymentMethods(methods)

    // Immediately dispatch validation event
    const event = new CustomEvent("paymentFormValidationChange", {
      detail: {
        isValid: methods.length > 0,
        formData: {
          paymentMethods: methods,
          instructions,
        },
      },
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  const handleOpenBottomSheet = () => {
    console.log("Opening bottom sheet")
    setBottomSheetOpen(true)
    if (onBottomSheetOpenChange) {
      onBottomSheetOpenChange(true)
    }
  }

  const handleCloseBottomSheet = () => {
    console.log("Closing bottom sheet")
    setBottomSheetOpen(false)
    if (onBottomSheetOpenChange) {
      onBottomSheetOpenChange(false)
    }
  }

  const isMethodSelected = (methodId: string) => paymentMethods.includes(methodId)
  const isMaxReached = paymentMethods.length >= MAX_PAYMENT_METHODS

  useEffect(() => {
    console.log("PaymentDetailsForm validation effect triggered")
    console.log("Current paymentMethods:", paymentMethods)
    console.log("Current instructions:", instructions)
    console.log("Form validity:", isFormValid())

    const event = new CustomEvent("paymentFormValidationChange", {
      detail: {
        isValid: isFormValid(),
        formData: {
          paymentMethods,
          instructions,
        },
      },
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [paymentMethods, instructions, initialData.type])

  // Sync with window.adPaymentMethodIds for sell ads
  useEffect(() => {
    if (initialData.type === "sell") {
      const checkPaymentMethodIds = () => {
        const selectedIds = (window as any).adPaymentMethodIds || []
        console.log("Checking sell ad payment method IDs:", selectedIds)

        // Dispatch validation event for sell ads based on selected IDs
        const event = new CustomEvent("paymentFormValidationChange", {
          detail: {
            isValid: selectedIds.length > 0,
            formData: {
              paymentMethods: [],
              payment_method_ids: selectedIds,
              instructions,
            },
          },
          bubbles: true,
        })
        document.dispatchEvent(event)
      }

      // Check immediately and then periodically
      checkPaymentMethodIds()
      const interval = setInterval(checkPaymentMethodIds, 500)
      return () => clearInterval(interval)
    }
  }, [initialData.type, instructions])

  return (
    <div className="h-full flex flex-col">
      <form id="payment-details-form" onSubmit={handleSubmit} className="flex-1 py-6">
        <div className="max-w-[800px] mx-auto h-full flex flex-col">
          <div className="space-y-8">
            {initialData.type === "buy" && (
              <div>
                <h3 className="text-base font-bold leading-6 tracking-normal mb-4">Select payment method</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment methods</label>

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
                          console.log("Mobile payment method button clicked")
                          handleOpenBottomSheet()
                        }}
                      >
                        <span className="font-normal text-base">
                          {paymentMethods.length > 0 ? `Selected (${paymentMethods.length})` : "Select payment method"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-70 ml-auto" />
                      </Button>

                      <PaymentMethodBottomSheet
                        isOpen={bottomSheetOpen}
                        onClose={handleCloseBottomSheet}
                        onSelect={(methods) => {
                          console.log("Bottom sheet onSelect called with:", methods)
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
                            <span className="font-medium text-sm text-black">Select payment method</span>
                            <span className="text-gray-400 text-sm">{`Selected (${paymentMethods.length})`}</span>
                          </div>
                        ) : (
                          <span className="font-normal text-base">
                            {paymentMethods.length > 0
                              ? `Selected (${paymentMethods.length})`
                              : "Select payment method"}
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
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black z-10" />
                          <Input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => {
                              e.stopPropagation()
                              setSearchQuery(e.target.value)
                            }}
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
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                              !isMethodSelected(method.method) && isMaxReached ? "opacity-50" : ""
                            }`}
                          >
                            <div
                              className={`w-5 h-5 flex items-center justify-center rounded border ${
                                isMethodSelected(method.method) ? "bg-black border-black" : "border-gray-300"
                              }`}
                            >
                              {isMethodSelected(method.method) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span>{method.display_name}</span>
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

            {initialData.type === "sell" && <AdPaymentMethods />}

            <div>
              <h3 className="text-base font-bold leading-6 tracking-normal mb-4">
                {initialData.type === "sell"
                  ? "Advertisers' instructions and contact details"
                  : "Instructions (Optional)"}
              </h3>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Advertisers' instructions"
                className="min-h-[120px] resize-none"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>
                  This information will be visible to everyone. Don&rsquo;t share your phone number or personal details.
                </span>
                <span>{instructions.length}/300</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
