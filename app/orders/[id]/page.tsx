"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import OrderChat from "@/components/order-chat"
import { OrdersAPI } from "@/services/api"
import type { Order } from "@/services/api/api-orders"
import { formatAmount, formatStatus, getStatusBadgeStyle } from "@/lib/utils"
import { useWebSocket } from "@/hooks/use-websocket"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // WebSocket connection for orders channel
  const { isConnected, joinChannel, leaveChannel, getChatHistory } = useWebSocket({
    onMessage: (data) => {
      // Handle websocket messages if needed
      console.log("WebSocket message received:", data)
    },
    onOpen: () => {
      // Join orders channel when websocket opens
      joinChannel("orders")
    },
  })

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  // Join orders channel when component mounts and websocket is connected
  useEffect(() => {
    if (isConnected) {
      joinChannel("orders")
    }

    // Leave orders channel when component unmounts or navigating away
    return () => {
      if (isConnected) {
        leaveChannel("orders")
      }
    }
  }, [isConnected, joinChannel, leaveChannel])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await OrdersAPI.getOrderDetails(orderId)
      if (response.success && response.data) {
        setOrder(response.data)
      } else {
        setError("Failed to load order details")
      }
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError("Failed to load order details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOrder = async () => {
    if (!order) return

    try {
      const response = await OrdersAPI.completeOrder(orderId)
      if (response.success) {
        // Refresh order details
        fetchOrderDetails()
      }
    } catch (error) {
      console.error("Error completing order:", error)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return

    try {
      const response = await OrdersAPI.cancelOrder(orderId)
      if (response.success) {
        // Refresh order details
        fetchOrderDetails()
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
    }
  }

  const handleConfirmPayment = async () => {
    if (!order) return

    try {
      const response = await OrdersAPI.confirmPayment(orderId)
      if (response.success) {
        // Refresh order details
        fetchOrderDetails()
      }
    } catch (error) {
      console.error("Error confirming payment:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error || "Order not found"}</p>
        <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
      </div>
    )
  }

  const counterpartyName = order.type === "buy" ? order.advert.user.nickname : order.user.nickname
  const counterpartyInitial = counterpartyName.charAt(0).toUpperCase()
  const isClosed = order.status === "completed" || order.status === "cancelled"

  return (
    <div className="flex h-screen">
      {/* Left Panel - Order Details */}
      <div className="w-1/2 border-r bg-white overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/orders")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isClosed && (
                  <>
                    {order.status === "pending" && order.type === "sell" && (
                      <DropdownMenuItem onClick={handleConfirmPayment}>Confirm Payment</DropdownMenuItem>
                    )}
                    {order.status === "buyer-confirmed" && order.type === "buy" && (
                      <DropdownMenuItem onClick={handleCompleteOrder}>Release Funds</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleCancelOrder} className="text-red-600">
                      Cancel Order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Order Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {order.type === "buy" ? (
                      <span className="text-green-600">Buy</span>
                    ) : (
                      <span className="text-red-600">Sell</span>
                    )}
                    <span className="ml-2">
                      {order.advert.account_currency} {formatAmount(order.amount)}
                    </span>
                  </h1>
                  <p className="text-gray-600">Order ID: {order.id}</p>
                </div>
                <Badge className={getStatusBadgeStyle(order.status, order.type)}>
                  {formatStatus(order.status, order.type)}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold">
                    {order.advert.account_currency} {formatAmount(order.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold">
                    {order.advert.payment_currency} {formatAmount(order.payment_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rate</p>
                  <p className="font-semibold">
                    {order.advert.payment_currency} {formatAmount(order.rate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Counterparty</p>
                  <p className="font-semibold">{counterpartyName}</p>
                </div>
              </div>

              {order.advert.payment_info && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Payment Details</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="text-sm whitespace-pre-wrap">{order.advert.payment_info}</pre>
                    </div>
                  </div>
                </>
              )}

              {order.advert.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Instructions</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm">{order.advert.description}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isClosed && (
            <div className="flex gap-3">
              {order.status === "pending" && order.type === "sell" && (
                <Button onClick={handleConfirmPayment} className="flex-1">
                  I've received payment
                </Button>
              )}
              {order.status === "buyer-confirmed" && order.type === "buy" && (
                <Button onClick={handleCompleteOrder} className="flex-1">
                  Release {order.advert.account_currency}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleCancelOrder}
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              >
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="w-1/2 bg-gray-50">
        <OrderChat
          orderId={orderId}
          counterpartyName={counterpartyName}
          counterpartyInitial={counterpartyInitial}
          isClosed={isClosed}
          isWebSocketConnected={isConnected}
          getChatHistory={getChatHistory}
        />
      </div>
    </div>
  )
}
