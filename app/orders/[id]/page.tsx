"use client"

export const runtime = "edge"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { X, ChevronRight } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { OrdersAPI } from "@/services/api"
import type { Order } from "@/services/api/api-orders"
import OrderChat from "@/components/order-chat"
import { useToast } from "@/hooks/use-toast"
import {
  cn,
  formatAmount,
  formatStatus,
  getPaymentMethodColour,
  getStatusBadgeStyle,
  copyToClipboard,
} from "@/lib/utils"
import OrderDetailsSidebar from "@/components/order-details-sidebar"
import { useWebSocketContext } from "@/contexts/websocket-context"
import { USER } from "@/lib/local-variables"
import Image from "next/image"
import { RatingSidebar } from "@/components/rating-filter"
import { ComplaintForm } from "@/components/complaint"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { OrderDetails } from "@/components/order-details"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"
import { PaymentConfirmationSidebar } from "../components/payment-confirmation-sidebar"

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { setIsChatVisible } = useChatVisibilityStore()

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
  const [showChat, setShowChat] = useState(false)
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false)
  const { isConnected, joinChannel, reconnect, subscribe } = useWebSocketContext()

  useEffect(() => {
    fetchOrderDetails()

    if (!isConnected) {
      reconnect()
    }
  }, [orderId])

  useEffect(() => {
    if (isConnected) {
      joinChannel("orders", orderId)
    }
  }, [isConnected, orderId])

  useEffect(() => {
    const unsubscribe = subscribe((data: any) => {
      if (
        ["buyer_paid", "completed", "cancelled", "refunded", "disputed", "user_review", "advertiser_review"].includes(
          data.payload.data?.event,
        ) &&
        data.payload.data?.order?.id == orderId
      ) {
        setOrder(data.payload.data.order)
      }
    })

    return unsubscribe
  }, [orderId, subscribe])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
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
        fetchOrderDetails()
        setShowPaymentConfirmation(false)
      }
    } catch (err) {
      console.error("Error marking payment as sent:", err)
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    setIsConfirmLoading(true)
    try {
      const result = await OrdersAPI.completeOrder(orderId)
      if (result.errors.length == 0) {
        fetchOrderDetails()
      }
    } catch (err) {
      console.error("Error completing order:", err)
    } finally {
      setIsConfirmLoading(false)
    }
  }

  const handleSubmitReview = () => {
    setShowRatingSidebar(false)
  }

  const handleSubmitComplaint = () => {
    setShowComplaintForm(false)
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
              <Button
                onClick={async () => {
                  const success = await copyToClipboard(String(val.value))
                  if (success) {
                    toast({
                      description: (
                        <div className="flex items-center gap-2">
                          <Image
                            src="/icons/success-checkmark.png"
                            alt="Success"
                            width={24}
                            height={24}
                            className="text-white"
                          />
                          <span>The text has been copied to your clipboard.</span>
                        </div>
                      ),
                      className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
                      duration: 2500,
                    })
                  }
                }}
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
              >
                <Image src="/icons/copy-icon.png" alt="Copy" width={24} height={24} className="text-slate-500" />
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

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          src={i <= rating ? "/icons/star-active.png" : "/icons/star-custom.png"}
          alt={i <= rating ? "Filled star" : "Empty star"}
          width={32}
          height={32}
        />,
      )
    }
    return stars
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

  const handleShowPaymentConfirmation = () => {
    setShowPaymentConfirmation(true)
  }

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

  const orderType =
    order?.type === "buy" ? (order?.user.id == USER.id ? "Buy" : "Sell") : order?.user.id == USER.id ? "Sell" : "Buy"
  const counterpartyNickname = order?.advert.user.id == USER.id ? order?.user?.nickname : order?.advert?.user?.nickname
  const counterpartyLabel =
    order?.type === "sell"
      ? order?.advert.user.id == USER.id
        ? "Seller"
        : "Buyer"
      : order?.advert.user.id == USER.id
        ? "Buyer"
        : "Seller"
  const youPayReceiveLabel =
    order?.type === "buy"
      ? order?.user.id == USER.id
        ? "You pay"
        : "You receive"
      : order?.user.id == USER.id
        ? "You receive"
        : "You pay"
  const complainType =
    order?.type === "sell"
      ? order?.advert.user.id == USER.id
        ? "buyer"
        : "seller"
      : order?.advert.user.id == USER.id
        ? "seller"
        : "buyer"

  if (isMobile && showChat && order) {
    return (
      <div className="h-[calc(100vh-64px)] mb-[64px] flex flex-col">
        <div className="flex-1 h-full">
          <OrderChat
            orderId={orderId}
            counterpartyName={counterpartyNickname || "User"}
            counterpartyInitial={(counterpartyNickname || "U")[0].toUpperCase()}
            isClosed={["cancelled", "completed", "refunded"].includes(order?.status)}
            onNavigateToOrderDetails={() => {
              setShowChat(false)
              setIsChatVisible(false)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="lg:absolute left-0 right-0 top-[32px] bottom-0 bg-white">
      {order?.type && (
        <Navigation
          isBackBtnVisible={false}
          isVisible={false}
          title={`${orderType} ${order?.advert?.account_currency}`}
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
                    order.status === "pending_payment" || order.status === "pending_release"
                      ? "justify-between"
                      : "justify-center",
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
                  {order.status === "completed" ? (
                    <OrderDetails order={order} setShowChat={setShowChat} />
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-slate-500 text-sm">{youPayReceiveLabel}</p>
                          <p className="font-bold">
                            {order?.payment_currency} {formatAmount(order.payment_amount)}
                          </p>
                        </div>
                        <button className="flex items-center text-sm" onClick={() => setShowDetailsSidebar(true)}>
                          View order details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-slate-500 text-sm">{counterpartyLabel}</p>
                          <p className="font-bold">{counterpartyNickname}</p>
                        </div>
                        {isMobile && (
                          <Button
                            onClick={() => {
                              setShowChat(true)
                              setIsChatVisible(true)
                            }}
                            className="text-slate-500 hover:text-slate-700"
                            variant="ghost"
                            size="sm"
                          >
                            <Image src="/icons/chat-icon.png" alt="Chat" width={20} height={20} />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {order.status !== "completed" && (
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
                                    <div
                                      className={`w-2 h-2 ${getPaymentMethodColour(method.type)} rounded-full`}
                                    ></div>
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
                )}

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
                    <Button className="flex-1" onClick={handleShowPaymentConfirmation}>
                      I've paid
                    </Button>
                  </div>
                )}
                {((order.type === "buy" &&
                  (order.status === "pending_release" || order.status === "timed_out") &&
                  order.advert.user.id == USER.id) ||
                  (order.type === "sell" &&
                    (order.status === "pending_release" || order.status === "timed_out") &&
                    order.user.id == USER.id)) && (
                  <div className="md:pl-4 pt-4 flex gap-4 md:float-right">
                    <Button className="flex-1" onClick={handleConfirmOrder} disabled={isConfirmLoading}>
                      {isConfirmLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "I've received payment"
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
                      <Button
                        variant="outline"
                        onClick={() => setShowRatingSidebar(true)}
                        className="flex-auto md:flex-none"
                      >
                        Rate transaction
                      </Button>
                    </div>
                  </div>
                )}
                {order.status === "completed" && !order.is_reviewable && order.rating && (
                  <div className="space-y-1 mt-[24px]">
                    <h2 className="text-base font-bold">Your transaction rating</h2>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                      <div className="flex items-center gap-1">{renderStars(order.rating)}</div>
                      {order.recommend && (
                        <div className="flex items-center gap-2">
                          <Image src="/icons/thumbs-up-green.png" alt="Recommended" width={16} height={16} />
                          <span className="text-sm">Recommended</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {order.status === "timed_out" && (
                  <div className="py-4 flex justify-end flex-auto md:flex-none">
                    <Button
                      variant="outline"
                      onClick={() => setShowComplaintForm(true)}
                      className="flex-auto md:flex-1"
                    >
                      Complain
                    </Button>
                  </div>
                )}
              </div>
              <div className="hidden lg:block w-full lg:w-1/2 border rounded-lg overflow-hidden flex flex-col h-[600px]">
                <OrderChat
                  orderId={orderId}
                  counterpartyName={counterpartyNickname || "User"}
                  counterpartyInitial={(counterpartyNickname || "U")[0].toUpperCase()}
                  isClosed={["cancelled", "completed", "refunded"].includes(order?.status)}
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
                      fetchOrderDetails()
                    }
                  } catch (error) {
                    console.error("Failed to cancel order:", error)
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
        type={complainType}
      />
      <RatingSidebar
        isOpen={showRatingSidebar}
        onClose={() => setShowRatingSidebar(false)}
        orderId={orderId}
        onSubmit={handleSubmitReview}
        recommendLabel={`Would you recommend this ${counterpartyLabel.toLowerCase()}?`}
      />
      <OrderDetailsSidebar isOpen={showDetailsSidebar} onClose={() => setShowDetailsSidebar(false)} order={order} />
      <PaymentConfirmationSidebar
        isOpen={showPaymentConfirmation}
        onClose={() => setShowPaymentConfirmation(false)}
        onConfirm={handlePayOrder}
        order={order}
        isLoading={isPaymentLoading}
      />
    </div>
  )
}
