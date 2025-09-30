"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { copyToClipboard, formatAmount, formatDateTime } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import type { OrderDetailItemProps } from "./types"

const OrderDetailItem = ({ label, value, testId }: OrderDetailItemProps) => (
  <div data-testid={testId}>
    <h3 className="text-sm text-slate-500 mb-1">{label}</h3>
    <p className="text-base font-bold">{value}</p>
  </div>
)

export const OrderDetails = ({ order, setShowChat }) => {
  const { toast } = useToast()
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
    <div className="space-y-[16px]" data-testid="order-details-container">
      <div className="flex items-end justify-between">
        <OrderDetailItem label="Order ID" value={order.id} testId="order-id-item" />
        <Button
          onClick={async () => {
            const success = await copyToClipboard(String(order.id))
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

      <OrderDetailItem
        label={`Exchange rate (${order?.advert?.account_currency} 1)`}
        value={`${order.payment_currency} ${exchangeRateValue}`}
        testId="exchange-rate-item"
      />

      <OrderDetailItem
        label={order.type === "buy" ? "You pay" : "You receive"}
        value={`${order.payment_currency} ${formatAmount(order.payment_amount)}`}
        testId="payment-amount-item"
      />

      <OrderDetailItem
        label={order.type === "buy" ? "You receive" : "You send"}
        value={`${order.advert?.account_currency} ${formatAmount(order.amount)}`}
        testId="amount-item"
      />

      <OrderDetailItem label="Order time" value={formatDateTime(order.created_at)} testId="order-time-item" />

      <div className="flex items-end justify-between">
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
