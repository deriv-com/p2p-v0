"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { Advertisement } from "@/services/api/api-buy-sell"
import { createOrder } from "@/services/api/api-orders"
import { ProfileAPI } from "@/services/api"
import { getCategoryDisplayName, formatPaymentMethodName, maskAccountNumber } from "@/lib/utils"
import Image from "next/image"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface OrderSidebarProps {
  isOpen: boolean
  onClose: () => void
  ad: Advertisement | null
  orderType: "buy" | "sell"
}

interface PaymentMethod {
  id: string
  type: string
  display_name: string
  fields: Record<string, any>
  is_enabled: number
  method: string
}

const PaymentSelectionContent = ({
  userPaymentMethods,
  isLoadingPaymentMethods,
  paymentMethodsError,
  tempSelectedPaymentMethods,
  setTempSelectedPaymentMethods,
  hideAlert,
  setSelectedPaymentMethods,
  handleAddPaymentMethodClick,
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
        {isLoadingPaymentMethods ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading payment methods...</span>
          </div>
        ) : paymentMethodsError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{paymentMethodsError}</p>
          </div>
        ) : userPaymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No compatible payment methods found</p>
            <p className="text-sm text-gray-500">Add a payment method that matches the buyer's accepted methods</p>
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
                      <div className="font-normal text-grayscale-text-mutedtext-xs">{`${formatPaymentMethodName(method.display_name)} - ${maskAccountNumber(method.fields.account.value)}`}</div>
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
            hideAlert()
          }}
        >
          <div className="flex items-center">
            <Image src="/icons/plus_icon.png" alt="Plus" width={14} height={24} className="mr-2" />
            <span className="text-slate-1200 text-base">Add payment method</span>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-4"
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

export default function OrderSidebar({ isOpen, onClose, ad, orderType }: OrderSidebarProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [amount, setAmount] = useState(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderStatus, setOrderStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null)
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [tempSelectedPaymentMethods, setTempSelectedPaymentMethods] = useState<string[]>([])
  const { hideAlert, showAlert } = useAlertDialog()

  const handleShowPaymentSelection = () => {
    showAlert({
      title: "Payment method",
      description: (
        <PaymentSelectionContent
          userPaymentMethods={userPaymentMethods}
          isLoadingPaymentMethods={isLoadingPaymentMethods}
          paymentMethodsError={paymentMethodsError}
          tempSelectedPaymentMethods={tempSelectedPaymentMethods}
          setTempSelectedPaymentMethods={setTempSelectedPaymentMethods}
          setShowAddPaymentMethod={setShowAddPaymentMethod}
          setSelectedPaymentMethods={setSelectedPaymentMethods}
          hideAlert={hideAlert}
          handleAddPaymentMethodClick={handleAddPaymentMethodClick}
        />
      ),
    })
  }

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      setOrderStatus(null)
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (ad) {
      fetchUserPaymentMethods()
    }
  }, [ad])

  useEffect(() => {
    if (ad && amount) {
      const numAmount = Number.parseFloat(amount)
      const exchangeRate = ad.exchange_rate || 0
      const total = numAmount * exchangeRate
      setTotalAmount(total)

      const minLimit = ad.minimum_order_amount || "0.00"
      const maxLimit = ad.actual_maximum_order_amount || "0.00"

      if (numAmount < minLimit || numAmount > maxLimit) {
        setValidationError(`Order limit: ${minLimit} - ${maxLimit} ${ad.account_currency}`)
      } else {
        setValidationError(null)
      }
    }
  }, [amount, ad])

  const fetchUserPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true)
      setPaymentMethodsError(null)

      const response = await ProfileAPI.getUserPaymentMethods()

      if (response.error) {
        setPaymentMethodsError(response.error.message || "Failed to fetch payment methods")
        return
      }

      const buyerAcceptedMethods = ad?.payment_methods || []
      const filteredMethods =
        response?.filter((method: PaymentMethod) => {
          return buyerAcceptedMethods.some(
            (buyerMethod: string) => method.method.toLowerCase() === buyerMethod.toLowerCase(),
          )
        }) || []

      setUserPaymentMethods(filteredMethods)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      setPaymentMethodsError("Failed to load payment methods")
    } finally {
      setIsLoadingPaymentMethods(false)
    }
  }

  if (!isOpen && !isAnimating) return null

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  const handleSubmit = async () => {
    if (!ad) return

    try {
      setIsSubmitting(true)
      setOrderStatus(null)

      const numAmount = Number.parseFloat(amount)

      const order = await createOrder(ad.id, numAmount, selectedPaymentMethods)
      if (order.errors.length > 0) {
        const errorCode = order.errors[0].code
        if (errorCode === "OrderExists") {
          showAlert({
            title: "Unable to create an order",
            description: "Order already exists.",
            confirmText: "OK",
            type: "warning",
          })
        } else {
          showAlert({
            title: "Unable to create an order",
            description: "There was an error when creating the order. Please try again.",
            confirmText: "OK",
            type: "warning",
          })
        }
      } else {
        router.push("/orders/" + order.data.id)
      }
    } catch (error) {
      setOrderStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create order. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setTotalAmount(0)
      setSelectedPaymentMethods([])
      setAmount(null)
      setValidationError(null)
      setShowAddPaymentMethod(false)
      onClose()
    }, 300)
  }

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingPaymentMethod(true)
      const response = await ProfileAPI.addPaymentMethod(method, fields)

      if (response.success) {
        await fetchUserPaymentMethods()
        if (!isMobile) {
          hideAlert()
        } else {
          setShowAddPaymentMethod(false)
        }
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

  const handleAddPaymentMethodClick = () => {
    if (!isMobile) {
      setShowAddPaymentMethod(true)
    } else {
      setShowAddPaymentMethod(true)
    }
  }

  const getSelectedPaymentMethodsText = () => {
    if (selectedPaymentMethods.length === 0) return "Select payment"
    if (selectedPaymentMethods.length === 1) {
      const method = userPaymentMethods.find((m) => m.id === selectedPaymentMethods[0])
      return method ? `${method.display_name}` : "Select payment"
    }
    return `Selected (${selectedPaymentMethods.length})`
  }

  const isBuy = orderType === "buy"
  const title = isBuy ? "Sell USD" : "Buy USD"
  const youSendText = isBuy ? "You receive" : "You pay"

  const minLimit = ad?.minimum_order_amount || "0.00"
  const maxLimit = ad?.actual_maximum_order_amount || "0.00"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen && isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full bg-white h-full transform transition-transform duration-300 ease-in-out ${
          isOpen && isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {ad && (
          <div className="flex flex-col h-full max-w-xl mx-auto">
            <div className="flex items-center justify-end px-4 py-3">
              <Button onClick={handleClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
                <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
              </Button>
            </div>

            <div className="flex flex-col h-full overflow-y-auto">
              <h2 className="text-xl font-bold p-4 pb-0">{title}</h2>
              <div className="p-4">
                <div className="mb-2">
                  <Input
                    value={amount}
                    onChange={handleAmountChange}
                    type="number"
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-4"
                    step="any"
                    inputMode="decimal"
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    variant="floatingCurrency"
                    currency={ad.account_currency}
                    label="Amount"
                  />
                </div>
                {validationError && <p className="text-xs text-red-500 text-sm mb-2">{validationError}</p>}
                <div className="flex items-center">
                  <span className="text-gray-500">{youSendText}:&nbsp;</span>
                  <span className="font-bold">
                    {Number.parseFloat(totalAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {ad.payment_currency}
                  </span>
                </div>
              </div>

              {isBuy && (
                <div className="mx-4 mt-4 pb-6 border-b">
                  <h3 className="text-sm text-slate-1400 mb-3">Receive payment to</h3>
                  <div
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleShowPaymentSelection}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{getSelectedPaymentMethodsText()}</span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              <div className="mx-4 mt-4 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">Exchange rate</span>
                  <span className="text-slate-1400">
                    {Number.parseFloat(ad.exchange_rate).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {ad.payment_currency}
                    <span> /{ad.account_currency}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">Order limit</span>
                  <span className="text-slate-1400">
                    {minLimit} - {maxLimit} {ad.account_currency}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">Payment time</span>
                  <span className="text-slate-1400">{ad.order_expiry_period} min</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">{isBuy ? "Buyer" : "Seller"}</span>
                  <span className="text-slate-1400">{ad.user?.nickname}</span>
                </div>
              </div>

              <div className="border-t m-4 mb-0 pt-4 text-sm flex flex-col md:flex-row justify-between">
                <h3 className="text-slate-500 flex-1">
                  {isBuy ? "Buyer's payment method(s)" : "Seller's payment method(s)"}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {ad.payment_methods?.map((method, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          method.toLowerCase().includes("bank") ? "bg-paymentMethod-bank" : "bg-paymentMethod-ewallet"
                        }`}
                      />
                      <span className="text-slate-1400">{formatPaymentMethodName(method)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-4 mt-4 border-t py-2 text-sm flex-1">
                <h3 className="text-slate-500">{isBuy ? "Buyer's instructions" : "Seller's instructions"}</h3>
                <p className="text-slate-1400 break-words">
                  {ad.description ||
                    "Kindly transfer the payment to the provided account details after placing your order."}
                </p>
              </div>

              <div className="mt-auto p-4 flex justify-end">
                <Button
                  className="w-full md:w-auto"
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={
                    !amount || (isBuy && selectedPaymentMethods.length === 0) || !!validationError || isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    "Place order"
                  )}
                </Button>
                {orderStatus && !orderStatus.success && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{orderStatus.message}</div>
                )}
              </div>
            </div>
          </div>
        )}
        {showAddPaymentMethod && (
          <AddPaymentMethodPanel
            onClose={() => setShowAddPaymentMethod(false)}
            onAdd={handleAddPaymentMethod}
            isLoading={isAddingPaymentMethod}
            allowedPaymentMethods={isBuy ? ad?.payment_methods : undefined}
            isInDialog={!isMobile}
            show={showAddPaymentMethod}
          />
        )}
      </div>
    </div>
  )
}
