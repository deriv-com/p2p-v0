"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { copyToClipboard, formatAmount, formatDateTime } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import type { OrderDetailItemProps } from "./types"

const OrderDetailItem = ({ hasCopy, label, value, testId }: OrderDetailItemProps) => {
  const { toast } = useToast()

  return (<div className="md:flex md:justify-between md:items-center md:border-b md:py-4" data-testid={testId}>
    <h3 className="text-sm text-slate-500 mb-1">{label}</h3>
    <div className="md:flex md:gap-2">
      <p className="text-sm font-bold">{value}</p>
      {hasCopy && <Button
        onClick={async () => {
          const success = await copyToClipboard(String(value))
          if (success) {
            toast({
              description: (
                <div className="flex items-center gap-2">
                  <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
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
      </Button>}
    </div>
  </div>)
}

export const OrderDetails = ({ order, setShowChat }) => {
  const isMobile = useIsMobile()
  const userId = useUserDataStore((state) => state.userId)

  if (!order) return null

  const counterpartyNickname =
    order?.advert?.user?.id === userId ? order?.user?.nickname : order?.advert?.user?.nickname

  const counterpartyLabel =
    order?.type === "sell"
      ? order?.advert?.user?.id === userId
        ? "Seller"
        : "Buyer"
      : order?.advert?.user?.id === userId
        ? "Buyer"
        : "Seller"

  const exchangeRateValue = order.exchange_rate?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div data-testid="order-details-container">

      <OrderDetailItem label="Order ID" value={order.id} testId="order-id-item" hasCopy={true} />

      <OrderDetailItem
        label={`Exchange rate (1 ${order?.advert?.account_currency})`}
        value={`${exchangeRateValue} ${order.payment_currency}`}
        testId="exchange-rate-item"
      />

      <OrderDetailItem
        label={order.type === "buy" ? "You pay" : "You receive"}
        value={`${formatAmount(order.payment_amount)} ${order.payment_currency}`}
        testId="payment-amount-item"
      />

      <OrderDetailItem
        label={order.type === "buy" ? "You receive" : "You send"}
        value={`${formatAmount(order.amount)} ${order.advert?.account_currency}`}
        testId="amount-item"
      />

      <OrderDetailItem label="Order time" value={formatDateTime(order.created_at)} testId="order-time-item" />

      <div className="flex md:block items-end justify-between">
        <OrderDetailItem label={counterpartyLabel} value={counterpartyNickname || ""} testId="counterparty-item" />
        {order.status === "completed" && isMobile && (
          <Button
            onClick={() => {
              setShowChat(true)
            }}
            className="text-slate-500 hover:text-slate-700"
            variant="ghost"
            size="sm"
          >
            <Image src="/icons/chat-icon.png" alt="Chat" width={20} height={20} />
          </Button>
        )}
      </div>
    </div>
  )
}
