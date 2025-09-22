"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { USER } from "@/lib/local-variables"
import { Button } from "@/components/ui/button"
import { OrdersAPI } from "@/services/api"
import type { Order } from "@/services/api/api-orders"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatAmount, formatStatus, getStatusBadgeStyle } from "@/lib/utils"
import { RatingSidebar } from "@/components/rating-filter/rating-sidebar"
import { useTimeRemaining } from "@/hooks/use-time-remaining"
import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"
import OrderChat from "@/components/order-chat"
import { useWebSocketContext } from "@/contexts/websocket-context"
import EmptyState from "@/components/empty-state"
import { useOrdersFilterStore } from "@/stores/orders-filter-store"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateFilter } from "./components/date-filter"
import { format, startOfDay, endOfDay } from "date-fns"

function TimeRemainingDisplay({ expiresAt }) {
  const timeRemaining = useTimeRemaining(expiresAt)
  const pad = (n: number) => String(n).padStart(2, "0")

  if (timeRemaining.hours && timeRemaining.minutes && timeRemaining.seconds) return null

  return (
    <div className="text-xs bg-[#0000000a] text-[#000000B8] rounded-sm w-fit py-[4px] px-[8px]">
      {`${pad(timeRemaining.hours)}:${pad(timeRemaining.minutes)}:${pad(timeRemaining.seconds)}`}
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { activeTab, setActiveTab, dateFilter, customDateRange, setDateFilter, setCustomDateRange } =
    useOrdersFilterStore()
  const { setIsChatVisible } = useChatVisibilityStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRatingSidebarOpen, setIsRatingSidebarOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const isMobile = useIsMobile()
  const { joinChannel } = useWebSocketContext()

  useEffect(() => {
    fetchOrders()
  }, [activeTab, dateFilter, customDateRange])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filters: {
        is_open?: boolean
        date_from?: string
        date_to?: string
      } = {}

      if (activeTab === "active") {
        filters.is_open = true
      } else {
        filters.is_open = false

        if (dateFilter !== "all") {
          if (customDateRange.from) {
            filters.date_from = format(startOfDay(customDateRange.from), "yyyy-MM-dd")
            if (customDateRange.to) {
              filters.date_to = format(endOfDay(customDateRange.to), "yyyy-MM-dd")
            } else {
              filters.date_to = format(endOfDay(customDateRange.from), "yyyy-MM-dd")
            }
          }
        }
      }

      const orders = await OrdersAPI.getOrders(filters)
      const ordersArray = Array.isArray(orders.data) ? orders.data : []

      setOrders(ordersArray)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const navigateToOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleRateClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation()
    setIsRatingSidebarOpen(true)
    setSelectedOrderId(order.id)
    setSelectedOrder(order)
  }

  const handleRatingSidebarClose = () => {
    setIsRatingSidebarOpen(false)
    setSelectedOrderId(null)
  }

  const handleRatingSubmit = () => {
    setIsRatingSidebarOpen(false)
    setSelectedOrderId(null)
    fetchOrders()
  }

  const handleChatClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation()
    if (isMobile) {
      setSelectedOrder(order)
      setShowChat(true)
      setIsChatVisible(true)

      joinChannel("orders", order.id)
    } else {
      navigateToOrderDetails(order.id)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "active" | "past")
  }

  const getOrderType = (order) => {
    if (order.type === "buy") {
      if (order.user.id == USER.id) return <span className="text-secondary text-base">Buy</span>
      else return <span className="text-destructive text-base">Sell</span>
    } else {
      if (order.user.id == USER.id) return <span className="text-destructive text-base">Sell</span>
      else return <span className="text-secondary text-base">Buy</span>
    }
  }

  const getRecommendLabel = () => {
    if (selectedOrder?.type === "sell") {
      if (selectedOrder?.advert.user.id == USER.id) return "seller"
      return "buyer"
    } else {
      if (selectedOrder?.advert.user.id == USER.id) return "buyer"
      return "seller"
    }
  }

  const getPayReceiveLabel = (order) => {
    let label = ""
    if (order.type === "buy") {
      if (order.user.id == USER.id) label = "You pay: "
      else label = "You receive: "
    } else {
      if (order.user.id == USER.id) label = "You receive: "
      else label = "You pay: "
    }

    return label
  }

  const DesktopOrderTable = () => (
    <div className="relative">
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <Table>
          <TableHeader className="hidden border-b sticky top-0 bg-white shadow-sm">
            <TableRow>
              {activeTab === "past" && <TableHead className="py-4 px-4 text-slate-600 font-normal">Date</TableHead>}
              <TableHead className="py-4 px-4 text-slate-600 font-normal">Order ID</TableHead>
              <TableHead className="py-4 px-4 text-slate-600 font-normal">Amount</TableHead>
              <TableHead className="py-4 px-4 text-slate-600 font-normal">Status</TableHead>
              {activeTab === "active" && <TableHead className="py-4 px-4 text-slate-600 font-normal">Time</TableHead>}
              {activeTab === "past" && <TableHead className="py-4 px-4 text-slate-600 font-normal">Rating</TableHead>}
              <TableHead className="py-4 px-4 text-slate-600 font-normal"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="lg:[&_tr:last-child]:border-1 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] gap-4 bg-white font-normal text-sm">
            {orders.map((order) => (
              <TableRow
                className="grid grid-cols-[2fr_1fr] border rounded-sm cursor-pointer"
                key={order.id}
                onClick={() => navigateToOrderDetails(order.id)}
              >
                {activeTab === "past" && (
                  <TableCell className="py-0 px-4 align-top text-slate-600 text-xs row-start-4 col-span-full">
                    {order.created_at ? formatDate(order.created_at) : ""}
                  </TableCell>
                )}
                <TableCell className="py-0 px-4 align-top row-start-2 col-span-full">
                  <div>
                    <div className="flex flex-row justify-between">
                      <div className="font-bold">
                        {getOrderType(order)}
                        <span className="text-base">
                          {" "}
                          {order.advert.account_currency} {formatAmount(order.amount)}
                        </span>
                      </div>
                      <div className="mt-[4px] text-slate-600 text-xs">ID: {order.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py px-4 align-top text-xs row-start-3">
                  <div className="flex flex-row-reverse justify-end gap-[4px]">
                    <div>
                      {order.payment_currency} {formatAmount(order.payment_amount)}
                    </div>
                    <div className="text-slate-600 text-xs">{getPayReceiveLabel(order)}</div>
                  </div>
                </TableCell>
                <TableCell className="px-4 align-top row-start-1">
                  <div
                    className={`inline px-[12px] py-[8px] rounded-[6px] text-xs ${getStatusBadgeStyle(order.status, order.type)}`}
                  >
                    {formatStatus(false, order.status, order.type)}
                  </div>
                </TableCell>
                {activeTab === "active" && (
                  <TableCell className="px-4 align-top row-start-1 col-start-2 justify-self-end">
                    {(order.status === "pending_payment" || order.status === "pending_release") && (
                      <TimeRemainingDisplay expiresAt={order.expires_at} />
                    )}
                  </TableCell>
                )}
                {activeTab === "past" && (
                  <TableCell className="py-0 px-4 align-top row-start-1 flex justify-end items-center">
                    {order.rating > 0 && (
                      <div className="flex">
                        <Image src="/icons/star-icon.png" alt="Rating" width={20} height={20} className="mr-1" />
                        {Number(order.rating).toFixed(1)}
                      </div>
                    )}
                    {order.is_reviewable > 0 && (
                      <Button variant="black" size="xs" onClick={(e) => handleRateClick(e, order)}>
                        Rate
                      </Button>
                    )}
                  </TableCell>
                )}
                <TableCell className="px-4 align-top row-start-4 col-span-full">
                  <div className="flex flex-row items-center justify-between">
                    <div className="text-xs">
                      {order.advert.user.id == USER.id ? order.user.nickname : order.advert.user.nickname}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          handleChatClick(e, order)
                        }}
                        className="text-slate-500 hover:text-slate-700 z-auto"
                        variant="ghost"
                        size="sm"
                      >
                        <Image src="/icons/chat-icon.png" alt="Chat" width={20} height={20} />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  if (isMobile && showChat && selectedOrder) {
    const counterpartyName =
      selectedOrder?.advert.user.id == USER.id ? selectedOrder?.user?.nickname : selectedOrder?.advert?.user?.nickname
    const counterpartyInitial = counterpartyName.charAt(0).toUpperCase()
    const isClosed = ["cancelled", "completed", "refunded"].includes(selectedOrder?.status)

    return (
      <div className="h-[calc(100vh-64px)] mb-[64px] flex flex-col">
        <div className="flex-1 h-full">
          <OrderChat
            orderId={selectedOrder.id}
            counterpartyName={counterpartyName}
            counterpartyInitial={counterpartyInitial}
            isClosed={isClosed}
            onNavigateToOrderDetails={() => {
              router.push(`/orders/${selectedOrder.id}`)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}
      <div className="flex flex-col h-full px-3">
        <div className="flex flex-col">
          <div className="w-full h-[80px] flex flex-row items-start md:items-center gap-[16px] md:gap-[24px] bg-slate-1200 p-6 rounded-b-3xl md:rounded-3xl justify-between">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full bg-transparent">
                <TabsTrigger
                  value="active"
                  className="w-auto data-[state=active]:font-bold data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="w-auto data-[state=active]:font-bold data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Past
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              onClick={handlePreviousOrdersClick}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-sm">Check previous orders</span>
              <span className="text-lg">→</span>
            </button>
          </div>
          <div className="my-4">
            {activeTab === "past" && (
              <DateFilter
                value={dateFilter}
                customRange={customDateRange}
                onValueChange={setDateFilter}
                onCustomRangeChange={setCustomDateRange}
              />
            )}
          </div>
        </div>
        <div className="flex-1 pb-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
              <p className="mt-2 text-slate-600">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchOrders} className="mt-4 text-white">
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-[40%] md:mt-0">
              <EmptyState
                icon="/icons/warning-circle.png"
                title="No orders found"
                description="Start by placing your first order."
              />
            </div>
          ) : (
            <div>
              <DesktopOrderTable />
            </div>
          )}
        </div>
        <RatingSidebar
          isOpen={isRatingSidebarOpen}
          onClose={handleRatingSidebarClose}
          orderId={selectedOrderId}
          onSubmit={handleRatingSubmit}
          recommendLabel={`Would you recommend this ${getRecommendLabel()}?`}
        />
      </div>
    </>
  )
}
