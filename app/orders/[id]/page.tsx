"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { X, ChevronRight } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { OrdersAPI } from "@/services/api"
import type { Order } from "@/services/api/api-orders"
import OrderChat from "@/components/order-chat"
import { toast } from "@/components/ui/use-toast"
import { cn, formatAmount, formatStatus, getPaymentMethodColour, getStatusBadgeStyle } from "@/lib/utils"
import OrderDetailsSidebar from "@/components/order-details-sidebar"
import { useWebSocketContext } from "@/contexts/websocket-context"
import { USER } from "@/lib/local-variables"
import Image from "next/image"
import { RatingSidebar } from "@/components/rating-filter"
import { ComplaintForm } from "@/components/complaint"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("--:--")
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showRatingSidebar, setShowRatingSidebar] = useState(false)
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const { isConnected, joinChannel } = useWebSocketContext()

  useEffect(() => {
    fetchOrderDetails()
    if (isConnected) {
      joinChannel("orders")
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Use the mock data for now since we're having issues with the API
      const order = await OrdersAPI.getOrderById(orderId)
      setOrder(order.data)
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError("Failed to load order details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayOrder = async () => {
    setIsPaymentLoading(true)
    try {
      const result = await OrdersAPI.payOrder(orderId)
      if (result.errors.length == 0) {
        toast({
          title: "Payment marked as sent",
          description: "The seller has been notified of your payment.",
          variant: "default",
        })
        fetchOrderDetails()
      }
    } catch (err) {
      console.error("Error marking payment as sent:", err)
      toast({
        title: "Payment notification failed",
        description: "Could not mark payment as sent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    setIsConfirmLoading(true)
    try {
      const result = await OrdersAPI.completeOrder(orderId)
      if (result.errors.length == 0) {
        toast({
          title: "Order completed",
          description: "The order has been successfully completed.",
          variant: "default",
        })
        fetchOrderDetails()
      }
    } catch (err) {
      console.error("Error completing order:", err)
      toast({
        title: "Completion failed",
        description: "Could not complete the order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConfirmLoading(false)
    }
  }

  const handleSubmitReview = () => {
    setShowRatingSidebar(false)
    fetchOrderDetails()
  }

  const handleSubmitComplaint = () => {
    setShowComplaintForm(false)
    fetchOrderDetails()
  }

  const formatRatingDeadline = (ratingDeadline) => {
    const deadline = new Date(ratingDeadline)

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "GMT",
      timeZoneName: "short",
    }

    return deadline.toLocaleDateString("en-GB", options)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "The text has been copied to your clipboard.",
        variant: "default",
      })
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const renderPaymentMethodFields = (method: any) => {
    const fields = []

    const copyableFields = ["account", "bank_code"]

    Object.entries(method).forEach(([key, val]) => {
      if (key === "method" || key === "type" || !val) return

      const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      const isCopyable = copyableFields.includes(key.toLowerCase())

      fields.push(
        <div key={key}>
          {val.value && <p className="text-xs text-slate-500 mb-1">{displayKey}</p>}
          {isCopyable ? (
            <div className="flex items-center justify-between">
              <p className="text-sm">{val.value}</p>
              <Button onClick={() => copyToClipboard(String(val.value))} variant="ghost" size="sm" className="p-0 h-auto">
                <Image src="/icons/copy-icon.png" alt="Copy" width={16} height={16} className="text-slate-500" />
              </Button>
            </div>
          ) : (
            <p className="text-sm">{val.value}</p>
          )}
        </div>,
      )
    })

    return fields
  }

  useEffect(() => {
    if (!order || !order.expires_at) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const expiryTime = new Date(order.expires_at)
      const diff = expiryTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("00:00")
        return false
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)

      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      return true
    }

    const hasTimeLeft = calculateTimeLeft()

    let intervalId: NodeJS.Timeout | null = null
    if (hasTimeLeft) {
      intervalId = setInterval(() => {
        const stillHasTime = calculateTimeLeft()
        if (!stillHasTime && intervalId) {
          clearInterval(intervalId)
          fetchOrderDetails()
        }
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [order])

  if (error) {
    return (
      <div className="px-4">
        <div className="text-center py-12">
          <p>{error || "Order not found"}</p>
          <Button onClick={fetchOrderDetails} className="mt-4 text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const orderType = order?.type === "buy" ? "Buy" : "Sell"
  const counterpartyNickname = order?.advert.user.id == USER.id ? order?.user?.nickname : order?.advert?.user?.nickname
  const counterpartyLabel = order?.type === "buy" ? "Seller" : "Buyer"
  const youPayReceiveLabel =
    order?.type === "buy"
      ? order?.user.id == USER.id
        ? "You receive"
        : "You pay"
      : order?.user.id == USER.id
        ? "You pay"
        : "You receive"

  return (
    <div className="lg:absolute left-0 right-0 top-[32px] bottom-0 bg-white">
      {order?.type && (
        <Navigation
          isBackBtnVisible={false}
          isVisible={false}
          title={`${orderType} ${order?.account_currency}`}
          redirectUrl={"/orders"}
        />
      )}
      <div className="container mx-auto px-[24px]">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
            <p className="mt-2 text-slate-600">Loading order details...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-row gap-6">
              <div className="w-full lg:w-1/2 rounded-lg">
                <div
                  className={cn(
                    `${getStatusBadgeStyle(order.status, order.type)} p-4 flex justify-between items-center rounded-none lg:rounded-lg mb-[24px] mt-[-16px] lg:mt-[0] mx-[-24px] lg:mx-[0]`,
                    order.status === "pending_payment" || order.status === "pending_release" ? "justify-between" : "justify-center",
                  )}
                >
                  <div className="flex items-center">
                    <span className="font-bold">{formatStatus(true, order.status, order.type)}</span>
                  </div>
                  {(order.status === "pending_payment" || order.status === "pending_release") && (
                    <div className="flex items-center">
                      <span>Time left:&nbsp;</span>
                      <span className="font-bold">{timeLeft}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 border rounded-lg mb-[24px]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-slate-500 text-sm">{youPayReceiveLabel}</p>
                      <p className="font-bold">
                        {order?.advert?.account_currency} {formatAmount(order.amount)}
                      </p>
                    </div>
                    <button className="flex items-center text-sm" onClick={() => setShowDetailsSidebar(true)}>
                      View order details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">{counterpartyLabel}</p>
                    <p className="font-bold">{counterpartyNickname}</p>
                  </div>
                </div>
                <div className="space-y-6 mt-4">
                  <div className="space-y-4">
                    {order.type === "buy" && <h2 className="text-lg font-bold">Seller payment details</h2>}
                    {order.type === "sell" && <h2 className="text-lg font-bold"> My payment details</h2>}
                    <div className="bg-orange-50 rounded-[16px] p-[16px]">
                      <div className="flex items-start gap-2">
                        <Image
                          src="/icons/warning-icon-new.png"
                          alt="Warning"
                          height={24}
                          width={24}
                          className="-mt-[2px]"
                        />
                        <p className="text-sm text-grayscale-100">
                          Cash transactions may carry risks. For safer payments, use bank transfers or e-wallets.
                        </p>
                      </div>
                    </div>

                    {order?.payment_method_details && order.payment_method_details.length > 0 && (
                      <div className="bg-white border rounded-lg mt-6">
                        <Accordion type="single" collapsible className="w-full">
                          {order.payment_method_details.map((method, index) => (
                            <AccordionItem key={index} value={`payment-method-${index}`} className="border-b-0">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 ${getPaymentMethodColour(method.type)} rounded-full`}></div>
                                  <span className="text-sm">{method.display_name}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4">{renderPaymentMethodFields(method.fields)}</div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </div>
                </div>

                {((order.type === "buy" && order.status === "pending_payment" && order.user.id == USER.id) ||
                  (order.type === "sell" && order.status === "pending_payment" && order.advert.user.id == USER.id)) && (
                    <div className="py-8 flex flex-col-reverse md:flex-row gap-2 md:gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setShowCancelConfirmation(true)}
                      >
                        Cancel order
                      </Button>
                      <Button className="flex-1" onClick={handlePayOrder} disabled={isPaymentLoading}>
                        {isPaymentLoading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          "I've paid"
                        )}
                      </Button>
                    </div>
                  )}
                {((order.type === "buy" && order.status === "pending_release" && order.advert.user.id == USER.id) ||
                  (order.type === "sell" && order.status === "pending_release" && order.user.id == USER.id)) && (
                    <div className="p-4 flex gap-4">
                      <Button className="flex-1" size="sm" onClick={handleConfirmOrder} disabled={isConfirmLoading}>
                        {isConfirmLoading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                    </div>
                  )}
                {order.status === "completed" && order.is_reviewable && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-[16px] bg-blue-50 rounded-2xl mt-[24px]">
                      <div className="flex-shrink-0">
                        <Image src="/icons/info-custom.png" alt="Info" width={24} height={24} />
                      </div>
                      <p className="text-sm text-grayscale-100">
                        You have until {formatRatingDeadline(order.order_review_expires_at)} to rate this transaction.
                      </p>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button variant="outline" onClick={() => setShowRatingSidebar(true)} className="flex-auto md:flex-none">
                        Rate transaction
                      </Button>
                    </div>
                  </div>
                )}
                {order.status === "timed_out" && (
                  <div className="py-4 flex justify-end flex-auto md:flex-none">
                    <Button variant="outline" onClick={() => setShowComplaintForm(true)} className="flex-auto md:flex-none">
                      Make a complaint
                    </Button>
                  </div>
                )}
              </div>
              <div className="hidden lg:block w-full lg:w-1/2 border rounded-lg overflow-hidden flex flex-col h-[600px]">
                <OrderChat
                  orderId={orderId}
                  counterpartyName={counterpartyNickname || "User"}
                  counterpartyInitial={(counterpartyNickname || "U")[0].toUpperCase()}
                  isClosed={["cancelled", "completed", "timed_out", "refunded"].includes(order?.status)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Cancelling your order?</h2>
              <button onClick={() => setShowCancelConfirmation(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-grayscale-100 mb-6">Don't cancel if you've already paid.</p>

            <div className="space-y-3">
              <Button variant="black" onClick={() => setShowCancelConfirmation(false)} className="w-full">
                Keep order
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setShowCancelConfirmation(false)
                  try {
                    const result = await OrdersAPI.cancelOrder(orderId)
                    if (result.success) {
                      toast({
                        title: "Order cancelled",
                        description: "Your order has been successfully cancelled.",
                        variant: "default",
                      })
                      fetchOrderDetails()
                    }
                  } catch (error) {
                    console.error("Failed to cancel order:", error)
                    toast({
                      title: "Cancellation failed",
                      description: "Could not cancel your order. Please try again.",
                      variant: "destructive",
                    })
                  }
                }}
                className="w-full"
              >
                Cancel order
              </Button>
            </div>
          </div>
        </div>
      )}

      <ComplaintForm
        isOpen={showComplaintForm}
        onClose={() => setShowComplaintForm(false)}
        onSubmit={handleSubmitComplaint}
        orderId={orderId}
      />
      <RatingSidebar
        isOpen={showRatingSidebar}
        onClose={() => setShowRatingSidebar(false)}
        orderId={orderId}
        onSubmit={handleSubmitReview}
      />
      <OrderDetailsSidebar isOpen={showDetailsSidebar} onClose={() => setShowDetailsSidebar(false)} order={order} />
    </div>
  )
}
