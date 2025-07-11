"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Order } from "@/services/api/api-orders"

interface OrderDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  order: Order
}

export default function OrderDetailsSidebar({ isOpen, onClose, order }: OrderDetailsSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-1 border-b">
          <h2 className="text-xl font-bold">Order details</h2>
          <Button onClick={onClose} variant="ghost" size="icon" className="p-1">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-slate-500 mb-1">Order ID</h3>
              <p className="text-base font-bold">{order.id}</p>
            </div>

            <div>
              <h3 className="text-sm text-slate-500 mb-1">Exchange rate</h3>
              <p className="font-bold">
                {order.advert?.account_currency} 1.00 = {order.advert?.payment_currency}{" "}
                {order.exchange_rate || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm text-slate-500 mb-1">{order.type === "buy" ? "You buy" : "You sell"}</h3>
              <p className="font-bold">
                {order.advert?.account_currency}{" "}
                {typeof order.amount === "object" && order.amount.value
                  ? Number(order.amount.value)
                  : typeof order.amount === "number"
                    ? order.amount
                    : Number(order.amount)}
              </p>
            </div>

            <div>
              <h3 className="text-sm text-slate-500 mb-1">{order.type === "buy" ? "You pay" : "You receive"}</h3>
              <p className="font-bold">
                {order.advert?.payment_currency}{" "}
                {typeof order.price === "object" && order.price.value
                  ? Number(order.price.value)
                  : typeof order.price === "number"
                    ? order.price
                    : Number(order.price)}
              </p>
            </div>

            <div>
              {order.type === "buy" ?
                <h3 className="text-sm text-slate-500 mb-1">Seller</h3> :
                <h3 className="text-sm text-slate-500 mb-1">Buyer</h3>}
              <p className="font-bold">{order.advert?.user?.nickname}</p>
            </div>

            <div>
              <h3 className="text-sm text-slate-500 mb-1">Status</h3>
              <p className="font-bold">{order.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
