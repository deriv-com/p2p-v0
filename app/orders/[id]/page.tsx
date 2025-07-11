"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {X, ChevronRight, Star, ThumbsUp, ThumbsDown } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { OrdersAPI } from "@/services/api"
import type { Order } from "@/services/api/api-orders"
import OrderChat from "@/components/order-chat"
import { toast } from "@/components/ui/use-toast"
import { cn, formatAmount, formatStatus } from "@/lib/utils"
import OrderDetailsSidebar from "@/components/order-details-sidebar"
import { USER } from "@/lib/local-variables"
import Image from "next/image"


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

  // Rating states
  const [showRatingSidebar, setShowRatingSidebar] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [recommend, setRecommend] = useState<boolean | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
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
    }
    finally {
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
        // Refresh order details to show updated status
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

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingReview(true)
    try {
      const reviewData = {
        rating,
        recommend,
      }

      const result = await OrdersAPI.reviewOrder(orderId, reviewData)
      if (result.errors.length === 0) {
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
          variant: "default",
        })
        setShowRatingSidebar(false)
        fetchOrderDetails() // Refresh order details
      }
    } catch (err) {
      console.error("Error submitting review:", err)
      toast({
        title: "Review submission failed",
        description: "Could not submit your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
    }
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
  const counterpartyLabel =
    order?.type === "buy"
      ? order?.user.id == USER.id
        ? "Seller"
        : "Buyer"
      : order?.user.id == USER.id
        ? "Buyer"
        : "Seller"
  const youPayReceiveLabel =
    order?.type === "buy"
      ? order?.user.id == USER.id
        ? "You receive"
        : "You pay"
      : order?.user.id == USER.id
        ? "You pay"
        : "You receive"

  return (
    <div className="absolute left-0 right-0 top-[32px] bottom-0 bg-white">
      {order?.type && <Navigation isBackBtnVisible={false} isVisible={false} title={`${orderType} ${order?.account_currency}`} redirectUrl={"/orders"} />}
      <div className="container mx-auto">
          {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
                <p className="mt-2 text-slate-600">Loading order details...</p>
              </div>) :
            (<div className="flex flex-col">
              <div className="flex flex-row gap-6">
                <div className="w-full lg:w-1/2 rounded-lg">
                  <div className="bg-blue-50 p-4 flex justify-between items-center border border-blue-50 rounded-lg mb-[24px]">
                    <div className="flex items-center">
                      <span className="text-blue-100 font-bold">
                        {formatStatus(order.status, order.type)}
                      </span>
                    </div>
                    {(order.status === "pending_payment" || order.status === "pending_release") &&
                      <div className="flex items-center text-blue-100">
                        <span>Time left: </span><span className="font-bold">{timeLeft}</span>
                      </div>
                    }
                  </div>
                  <div className="p-4 border rounded-lg mb-[24px]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-slate-500 text-sm">{youPayReceiveLabel}</p>
                        <p className="text-lg font-bold">
                          {order?.advert?.account_currency}{" "}
                          {formatAmount(order.amount)}
                        </p>
                      </div>
                      <button className="flex items-center text-sm" onClick={() => setShowDetailsSidebar(true)}>
                        View order details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>

                    <div>
                      <p className="text-slate-500 text-sm">{counterpartyLabel}</p>
                      <p className="font-medium">{counterpartyNickname}</p>
                    </div>
                  </div>
                  <div className="space-y-6 mt-4">
                    <div className="space-y-4">
                      {order.type === "buy" && <h2 className="text-lg font-bold">Seller payment details</h2>}
                      {order.type === "sell" && <h2 className="text-lg font-bold"> My payment details</h2>}
                      <div className="bg-orange-50 rounded-[16px] p-[16px]">
                        <div className="flex items-start gap-3">
                        <Image src="/icons/warning-icon.png" alt="Warning" width={20} height={20} className="h-5 w-5"/> 
                          <p className="text-sm text-gray-900">
                            Cash transactions may carry risks. For safer payments, use bank transfers or e-wallets.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {((order.type === "buy" && order.status === "pending_payment" && order.user.id == USER.id) ||
                    (order.type === "sell" && order.status === "pending_payment" && order.advert.user.id == USER.id)) && (
                      <div className="py-4 flex gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowCancelConfirmation(true)}
                        >
                          Cancel order
                        </Button>
                        <Button className="flex-1" size="sm" onClick={handlePayOrder} disabled={isPaymentLoading}>
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
                    <div className="p-4">
                      <Button variant="destructive" size="sm" className="w-full" onClick={() => setShowRatingSidebar(true)}>
                        Rate order
                      </Button>
                    </div>
                  )}
                </div>
                <div className="hidden lg:block w-full lg:w-1/2 border rounded-lg overflow-hidden flex flex-col h-[600px]">
                  <OrderChat
                    orderId={orderId}
                    counterpartyName={counterpartyNickname || "User"}
                    counterpartyInitial={(counterpartyNickname || "U")[0].toUpperCase()}
                    isClosed={["cancelled", "completed", "timed_out"].includes(order?.status))}
                  />
                </div>
              </div>
            </div>)
        }
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

            <p className="text-slate-700 mb-6">Don't cancel if you've already paid.</p>

            <div className="space-y-3">
              <Button onClick={() => setShowCancelConfirmation(false)} className="w-full">
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
                      fetchOrderDetails();
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

      {showRatingSidebar && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Rate this transaction</h2>
              <button onClick={() => setShowRatingSidebar(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-8">
                {/* Star Rating */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">How would you rate this transaction?</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Would you recommend this Seller?</h3>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setRecommend(true)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 border rounded-md",
                        recommend === true ? "border-green-500 bg-green-50" : "border-gray-300",
                      )}
                    >
                      <ThumbsUp className={cn("h-5 w-5", recommend === true ? "text-green-500" : "text-gray-400")} />
                      <span className={cn(recommend === true ? "text-green-700" : "text-gray-600")}>Yes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecommend(false)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 border rounded-md",
                        recommend === false ? "border-red-500 bg-red-50" : "border-gray-300",
                      )}
                    >
                      <ThumbsDown className={cn("h-5 w-5", recommend === false ? "text-red-500" : "text-gray-400")} />
                      <span className={cn(recommend === false ? "text-red-700" : "text-gray-600")}>No</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button onClick={handleSubmitReview} disabled={isSubmittingReview || rating === 0} className="w-full">
                {isSubmittingReview ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      <OrderDetailsSidebar isOpen={showDetailsSidebar} onClose={() => setShowDetailsSidebar(false)} order={order} />
    </div>
  )
}
