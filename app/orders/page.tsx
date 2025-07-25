"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrdersAPI } from "@/services/api"
import type { Order } from "@/services/api/api-orders"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatAmount, formatStatus, getStatusBadgeStyle } from "@/lib/utils"
import { RatingSidebar } from "@/components/rating-filter/rating-sidebar"
import { useTimeRemaining } from "@/hooks/use-time-remaining"
import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"

function TimeRemainingDisplay({ expiresAt }) {
  const timeRemaining = useTimeRemaining(expiresAt)
  const pad = (n: number) => String(n).padStart(2, '0')

  if (timeRemaining.hours && timeRemaining.minutes && timeRemaining.seconds) return null

  return (
    <div className="text-xs bg-[#0000000a] text-[#000000B8] rounded-sm w-fit py-[4px] px-[8px]">
      {`${pad(timeRemaining.hours)}:${pad(timeRemaining.minutes)}:${pad(timeRemaining.seconds)}`}
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"active" | "past">("active")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRatingSidebarOpen, setIsRatingSidebarOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchOrders()
  }, [activeTab])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filters: {
        is_open?: boolean
      } = {}

      if (activeTab === "active") {
        filters.is_open = true
      } else {
        filters.is_open = false
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

  const DesktopOrderTable = () => (
    <div className="relative">
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <Table>
          <TableHeader className="hidden lg:table-header-group border-b sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
              {activeTab === "past" && <TableHead className="py-4 px-4 text-slate-600 font-normal">Date</TableHead>}
              <TableHead className="py-4 px-4 text-slate-600 font-normal">Order ID</TableHead>
              <TableHead className="py-4 px-4 text-slate-600 font-normal">Amount</TableHead>
              <TableHead className="py-4 px-4 text-slate-600 font-normal">Status</TableHead>
              {activeTab === "active" &&
                <TableHead className="py-4 px-4 text-slate-600 font-normal">Time</TableHead>
              }
              {activeTab === "past" && <TableHead className="py-4 px-4 text-slate-600 font-normal">Rating</TableHead>}
              <TableHead className="py-4 px-4 text-slate-600 font-normal"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white lg:divide-y lg:divide-slate-200 font-normal text-sm">
            {orders.map((order) => (
              <TableRow
                className="grid grid-cols-[2fr_1fr] lg:flex flex-col border rounded-sm mb-[16px] lg:table-row lg:border-x-[0] lg:border-t-[0] lg:mb-[0] cursor-pointer"
                key={order.id}
                onClick={() => navigateToOrderDetails(order.id)}
              >
                {activeTab === "past" && (
                  <TableCell className="py-0 lg:py-4 px-4 align-top text-slate-600 text-xs row-start-4 col-span-full">
                    {order.created_at ? formatDate(order.created_at) : ""}
                  </TableCell>
                )}
                <TableCell className="py-0 lg:py-4 px-4 align-top row-start-2 col-span-full">
                  <div>
                    <div className="flex flex-row lg:flex-col justify-between">
                      <div className="font-bold">
                        {order.type === "buy" ? (
                          <span className="text-secondary text-base">Buy</span>
                        ) : (
                          <span className="text-destructive text-base">Sell</span>
                        )}
                        <span className="text-base">
                          {" "}
                          {order.advert.account_currency} {formatAmount(order.amount)}
                        </span>
                      </div>
                      <div className="mt-[4px] text-slate-600 text-xs">ID: {order.id}</div>
                    </div>
                    {!isMobile && <div className="mt-[4px] text-slate-600 text-xs">
                      Counterparty: {order.type === "buy" ? order.advert.user.nickname : order.user.nickname}{" "}
                    </div>}
                  </div>
                </TableCell>
                <TableCell className="py-0 lg:py-4 px-4 align-top text-xs lg:text-base row-start-3">
                  <div className="lg:font-bold">
                    {order.advert.payment_currency} {formatAmount(order.payment_amount)}
                  </div>
                </TableCell>
                <TableCell className="lg:py-4 px-4 align-top row-start-1">
                  <div
                    className={`inline px-[12px] py-[8px] rounded-[6px] text-xs ${getStatusBadgeStyle(order.status, order.type)}`}
                  >
                    {formatStatus(false, order.status, order.type)}
                  </div>
                </TableCell>
                {activeTab === "active" && (
                  <TableCell className="lg:py-4 px-4 align-top row-start-1 col-start-2 justify-self-end">
                    {(order.status === "pending_payment" || order.status === "pending_release") && (
                      <TimeRemainingDisplay expiresAt={order.expires_at} />
                    )}
                  </TableCell>
                )}
                {activeTab === "past" && (
                  <TableCell className="py-0 lg:py-4 px-4 align-top row-start-1 flex justify-end items-center lg:justify-start">
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
                <TableCell className="lg:py-4 px-4 align-top row-start-4 col-span-full">
                  <div className="flex flex-row items-center justify-between">
                    {isMobile && <div className="text-xs">
                      {order.type === "buy" ? order.advert.user.nickname : order.user.nickname}
                    </div>}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToOrderDetails(order.id)
                      }}
                      className="text-slate-500 hover:text-slate-700"
                      variant="ghost"
                      size="sm"
                    >
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9Nwf9GLJPQ6HUQ8qsdDIBqeJZRacom.png"
                        alt="View Details"
                        width={20}
                        height={20}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  return (
    <>
      {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}
      <div className="flex flex-col h-full px-[24px]">
        <div className="flex-shrink-0">
          <div className="mb-6">
            <Tabs className="w-full md:w-[330px] md:min-w-[330px]" defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "past")}>
              <TabsList className="w-full md:w-[330px] md:min-w-[330px]">
                <TabsTrigger className="w-full data-[state=active]:font-bold" value="active">
                  Active orders
                </TabsTrigger>
                <TabsTrigger className="w-full data-[state=active]:font-bold" value="past">
                  Past orders
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <h2 className="text-xl font-medium text-slate-900 mb-2">No orders found</h2>
              <p className="text-slate-500">Start by placing your first order.</p>
              <Button size="sm" onClick={() => router.push("/")} className="mt-8">
                Browse Ads
              </Button>
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
        />
      </div>
    </>
  )
}
