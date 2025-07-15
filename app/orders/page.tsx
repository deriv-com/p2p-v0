"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrdersAPI } from "@/services/api"
import type { Order } from "@/services/api/api-orders"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { formatAmount, formatStatus } from "@/lib/utils"

export default function OrdersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"active" | "past">("active")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const getStatusBadgeStyle = (status: string, type: string) => {
    switch (status) {
      case "pending_payment":
        return type === "buy" ? "bg-blue-50 text-blue-800" : "bg-yellow-100 text-yellow-1000"
      case "pending_release":
        return type === "buy" ? "bg-yellow-100 text-yellow-1000" : "bg-blue-50 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-slate-100 text-slate-800"
      case "disputed":
        return "bg-yellow-100 text-yellow-1000"
      case "timed_out":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-blue-50 text-blue-800"
    }
  }

  const navigateToOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const MobileOrderCards = () => (
    <div className="space-y-4">
      {orders.map((order) => {
        const orderType = order.type
        const orderTypeColor = orderType === "buy" ? "text-green-500" : "text-red-500"
        const statusText = order.status
        const statusStyle = getStatusBadgeStyle(order.status, orderType)

        return (
          <Card
            key={order.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigateToOrderDetails(order.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-xs ${statusStyle}`}>{statusText}</span>
                <div className="flex items-center text-slate-500">
                  <span className="text-xs">00:59:59</span>
                </div>
              </div>

              <div className="mb-2">
                <span className={`text-base font-medium ${orderTypeColor}`}>{orderType}</span>
                <span className="text-base font-medium"> {order.advert.payment_currency} </span>
                <span className="text-base font-medium"> {formatAmount(order.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500">ID: {order.id}</div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateToOrderDetails(order.id)
                    }}
                    className="text-slate-500 hover:text-slate-700"
                    variant="ghost"
                  >
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9Nwf9GLJPQ6HUQ8qsdDIBqeJZRacom.png"
                      alt="Chat"
                      width={20}
                      height={20}
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const DesktopOrderTable = () => (
    <div className="relative">
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
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
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="cursor-pointer" onClick={() => navigateToOrderDetails(order.id)}>
                {activeTab === "past" && (
                  <TableCell className="py-4 px-4 align-top text-slate-600 text-xs">
                    {order.created_at ? formatDate(order.created_at) : ""}
                  </TableCell>
                )}
                <TableCell className="py-4 px-4 align-top">
                  <div>
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
                    <div className="mt-[4px] text-slate-600 text-xs">Counterparty: {order.advert.user.nickname}</div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top text-base">
                  <div className="font-bold">
                    {order.advert.payment_currency} {formatAmount(order.payment_amount)}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  <div
                    className={`inline px-[12px] py-[8px] rounded-[6px] text-xs ${getStatusBadgeStyle(order.status, order.type)}`}
                  >
                    {formatStatus(order.status, order.type)}
                  </div>
                </TableCell>
                {activeTab === "active" && <TableCell className="py-4 px-4 align-top"></TableCell>}
                {activeTab === "past" && (
                  <TableCell className="py-4 px-4 align-top">
                    {order.rating > 0 && (
                      <div className="flex">
                        <Image src="/icons/star-icon.png" alt="Chat" width={20} height={20} className="mr-1" />
                        {order.rating}
                      </div>
                    )}
                  </TableCell>
                )}
                <TableCell className="py-4 px-4 align-top">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateToOrderDetails(order.id)
                    }}
                    className="text-slate-500 hover:text-slate-700"
                    variant="ghost"
                  >
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9Nwf9GLJPQ6HUQ8qsdDIBqeJZRacom.png"
                      alt="Chat"
                      width={20}
                      height={20}
                    />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="mb-6">
          <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "past")}>
            <TabsList className="md:min-w-[330px]">
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

      {/* Content - Scrollable area */}
      <div className="flex-1 pb-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
            <p className="mt-2 text-slate-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p>{error}</p>
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
          <>
            <div className="md:hidden">
              <MobileOrderCards />
            </div>
            <div className="hidden md:block">
              <DesktopOrderTable />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
