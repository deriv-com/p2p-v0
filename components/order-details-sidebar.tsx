"use client"

import { Button } from "@/components/ui/button"
import type { Order } from "@/services/api/api-orders"
import { formatAmount, formatDateTime } from "@/lib/utils"
import Image from "next/image"
import { USER } from "@/lib/local-variables"

interface OrderDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  order: Order
}

export default function OrderDetailsSidebar({ isOpen, onClose, order }: OrderDetailsSidebarProps) {
  if (!isOpen) return null
  
  const counterpartyNickname = order?.advert.user.id == USER.id ? order?.user?.nickname : order?.advert?.user?.nickname
  const counterpartyLabel = order?.type === "sell" ? (order?.advert.user.id == USER.id ? "Seller" : "Buyer") :
  (order?.advert.user.id == USER.id ? "Buyer" : "Seller")

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-xl font-bold">Order details</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-[16px]">
            <div>
              <h3 className="text-sm text-slate-500 mb-1">Order ID</h3>
              <p className="text-base font-bold">{order.id}</p>
            </div>
            <div>
              <h3 className="text-sm text-slate-500 mb-1">Exchange rate ({order.advert?.account_currency} 1)</h3>
              <p className="font-bold">
                {order.advert?.payment_currency}{" "}
                {order.exchange_rate.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-slate-500 mb-1">{order.type === "buy" ? "You pay" : "You receive"}</h3>
              <p className="font-bold">
                {order.advert?.payment_currency}{" "}
                {formatAmount(order.payment_amount)}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-slate-500 mb-1">{order.type === "buy" ? "You receive" : "You send"}</h3>
              <p className="font-bold">
                {order.advert?.account_currency}{" "}
                {formatAmount(order.amount)}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-slate-500 mb-1">Order time</h3>
              <p className="font-bold">
                {formatDateTime(order.created_at)}
              </p>
            </div>
            <div>
              <h3 className="text-sm text-slate-500 mb-1">{counterpartyLabel}</h3>
              <p className="font-bold">{counterpartyNickname}</p> 
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
