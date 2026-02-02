"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { copyToClipboard, formatAmount, formatDateTime } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import type { OrderDetailItemProps } from "./types"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/use-translations"

const OrderDetailItem = ({ hasCopy, label, value, testId, isBlockLayout }: OrderDetailItemProps) => {
  const { toast } = useToast()
  const { t } = useTranslations()

  return (
    <div
      className={cn(!isBlockLayout && "md:flex md:justify-between md:items-center md:border-b md:py-4")}
      data-testid={testId}
    >
      <h3 className="text-sm text-slate-500">{label}</h3>
      <div className={cn("flex justify-between", !isBlockLayout && "md:justify-start md:gap-2")}>
        <p className="text-sm font-bold">{value}</p>
        {hasCopy && (
          <Button
            onClick={async () => {
              const success = await copyToClipboard(String(value))
              if (success) {
                toast({
                  description: (
                    <div className="flex items-center gap-2">
                      <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                      <span>{t("orderDetails.textCopiedToClipboard")}</span>
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
        )}
      </div>
    </div>
  )
}

export const OrderDetails = ({ order, setShowChat }) => {
  const isMobile = useIsMobile()
  const userId = useUserDataStore((state) => state.userId)
  const { t } = useTranslations()

  if (!order) return null

  const counterpartyNickname =
    order?.advert?.user?.id === userId ? order?.user?.nickname : order?.advert?.user?.nickname

  const counterpartyLabel =
    order?.type === "sell"
      ? order?.advert?.user?.id === userId
        ? t("orderDetails.seller")
        : t("orderDetails.buyer")
      : order?.advert?.user?.id === userId
        ? t("orderDetails.buyer")
        : t("orderDetails.seller")

  const exchangeRateValue = order.exchange_rate?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const isBlockLayout = order.status === "completed" || isMobile

  return (
    <div className={cn("space-y-4", !isBlockLayout && "md:space-y-1")} data-testid="order-details-container">
      <OrderDetailItem
        label={t("orderDetails.orderId")}
        value={order.id}
        testId="order-id-item"
        hasCopy={true}
        isBlockLayout={isBlockLayout}
      />

      <OrderDetailItem
        label={t("orderDetails.exchangeRate", { currency: order?.advert?.account_currency })}
        value={`${exchangeRateValue} ${order.payment_currency}`}
        testId="exchange-rate-item"
        isBlockLayout={isBlockLayout}
      />

      <OrderDetailItem
        label={order.type === "buy" ? t("orderDetails.youPay") : t("orderDetails.youReceive")}
        value={`${formatAmount(order.payment_amount)} ${order.payment_currency}`}
        testId="payment-amount-item"
        isBlockLayout={isBlockLayout}
      />

      <OrderDetailItem
        label={order.type === "buy" ? t("orderDetails.youReceive") : t("orderDetails.youSend")}
        value={`${formatAmount(order.amount)} ${order.advert?.account_currency}`}
        testId="amount-item"
        isBlockLayout={isBlockLayout}
      />

      <OrderDetailItem
        label={t("orderDetails.orderTime")}
        value={formatDateTime(order.created_at)}
        testId="order-time-item"
        isBlockLayout={isBlockLayout}
      />

      <div className="flex md:block items-end justify-between">
        <OrderDetailItem
          label={counterpartyLabel}
          value={counterpartyNickname || ""}
          testId="counterparty-item"
          isBlockLayout={isBlockLayout}
        />
        {order.status === "completed" && isMobile && (
          <Button
            onClick={(e) => {
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
