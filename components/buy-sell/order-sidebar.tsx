"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Advertisement } from "@/services/api/api-buy-sell"
import { createOrder } from "@/services/api/api-orders"

interface OrderSidebarProps {
  isOpen: boolean
  onClose: () => void
  ad: Advertisement | null
  orderType: "buy" | "sell"
}

export default function OrderSidebar({ isOpen, onClose, ad, orderType }: OrderSidebarProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [totalAmount, setTotalAmount] = useState("0")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderStatus, setOrderStatus] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      setOrderStatus(null)
    } else {
      // Reset animation state when closed
      setIsAnimating(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (ad && ad.minimum_order_amount) {
      setAmount(ad.minimum_order_amount.toFixed(2))
    }
  }, [ad])

  useEffect(() => {
    if (ad && amount) {
      const numAmount = Number.parseFloat(amount)
      const exchangeRate = ad.exchange_rate || 0
      const total = (numAmount * exchangeRate).toFixed(2)
      setTotalAmount(total)

      // Validate amount against limits
      const minLimit = ad.minimum_order_amount || 0
      const maxLimit = ad.actual_maximum_order_amount || 0

      if (numAmount < minLimit) {
        setValidationError(`Amount must be at least ${ad.account_currency} ${minLimit.toFixed(2)}`)
      } else if (numAmount > maxLimit) {
        setValidationError(`Amount cannot exceed ${ad.account_currency} ${maxLimit.toFixed(2)}`)
      } else {
        setValidationError(null)
      }
    }
  }, [amount, ad])

  if (!isOpen && !isAnimating) return null

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  const handleSubmit = async () => {
    if (!ad) return

    try {
      setIsSubmitting(true)
      setOrderStatus(null)

      // Convert amount to number
      const numAmount = Number.parseFloat(amount)

      // Call the API to create the order
      const order = await createOrder(ad.id, numAmount)
      router.push("/orders/" + order.data.id)
    } catch (error) {
      console.error("Failed to create order:", error)
      setOrderStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create order. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // First set animating to false (which will trigger the closing animation)
    setIsAnimating(false)
    // Then actually close after animation completes
    setTimeout(() => {
      onClose()
    }, 300) // Match this with the CSS transition duration
  }

  const isBuy = orderType === "buy"
  const title = isBuy ? "Sell USD" : "Buy USD"
  const youSendText = isBuy ? "You receive" : "You send"

  // Calculate order limits
  const minLimit = ad?.minimum_order_amount?.toFixed(2) || "0.00"
  const maxLimit = ad?.actual_maximum_order_amount?.toFixed(2) || "0.00"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen && isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full max-w-md bg-white h-full overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen && isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {ad && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-2xl font-bold">{title}</h2>
              <Button onClick={handleClose} variant="ghost" className="p-1">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4 bg-gray-50 m-4 rounded-lg">
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <Input type="number" value={amount} onChange={handleAmountChange} placeholder="Enter amount" />
                  <span className="text-gray-500 hidden">{ad.account_currency}</span>
                </div>
              </div>
              {validationError && <p className="text-xs text-red-500 text-sm mb-2">{validationError}</p>}
              <div className="flex items-center">
                <span className="text-gray-500">{youSendText}:&nbsp;</span>
                <span className="font-bold">
                  {ad.payment_currency}{" "}
                  {Number.parseFloat(totalAmount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="mx-4 mt-4 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Rate ({ad.account_currency} 1)</span>
                <span className="font-medium">
                  {ad.payment_currency} {ad.exchange_rate?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Order limit</span>
                <span className="font-medium">
                  {ad.account_currency} {minLimit} - {maxLimit}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Payment time</span>
                <span className="font-medium">{ad.order_expiry_period} min</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">{isBuy ? "Buyer" : "Seller"}</span>
                <span className="font-medium">{ad.user?.nickname}</span>
              </div>
            </div>
            <div className="border-t m-4 py-2 text-sm">
              <h3 className="text-gray-500">{isBuy ? "Buyer's payment method(s)" : "Seller's payment method(s)"}</h3>
              <div className="flex flex-wrap gap-4">
                {ad.payment_method_names?.map((method, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`h-4 w-4 rounded-full mr-2 ${
                        method.toLowerCase().includes("bank")
                          ? "bg-green-500"
                          : method.toLowerCase().includes("wallet") || method.toLowerCase().includes("ewallet")
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <span className="font-medium">
                      {method.toLowerCase().includes("bank")
                        ? "Bank transfer"
                        : method.toLowerCase().includes("wallet") || method.toLowerCase().includes("ewallet")
                          ? "eWallet"
                          : method}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mx-4 mt-4 border-t py-2 text-sm">
              <h3 className="text-gray-500">{isBuy ? "Buyer's instructions" : "Seller's instructions"}</h3>
              <p className="text-gray-800 break-words">
                {ad.description ||
                  "Kindly transfer the payment to the provided account details after placing your order."}
              </p>
            </div>
            <div className="mt-auto p-4 border-t">
              <Button
                className="w-full"
                variant={isBuy ? "destructive" : "secondary"}
                size="lg"
                onClick={handleSubmit}
                disabled={!!validationError || isSubmitting}
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
        )}
      </div>
    </div>
  )
}
