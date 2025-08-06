"use client"

import { useState } from "react"
import Image from "next/image"
import { formatAmount, formatDateTime } from "@/lib/utils"
import { USER } from "@/lib/local-variables"
import type { OrderDetailsProps, OrderDetailItemProps } from './types'

const OrderDetailItem = ({ label, value, testId, showCopy, onCopy }: OrderDetailItemProps) => (
  <div data-testid={testId}>
    <h3 className="text-sm text-slate-500 mb-1">{label}</h3>
    <div className="flex items-center justify-between">
      <p className="text-base font-bold">{value}</p>
      {showCopy && onCopy && (
        <button
          onClick={onCopy}
          className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
          data-testid="copy-order-id-button"
          aria-label="Copy order ID"
        >
          <Image
            src="/icons/copy-icon.png"
            alt="Copy"
            width={16}
            height={16}
            className="opacity-60 hover:opacity-100"
          />
        </button>
      )}
    </div>
  </div>
)

const CopySuccessIcon = () => (
  <div data-testid="copy-success-icon" className="ml-2 p-1">
    <Image
      src="/icons/check-icon.png"
      alt="Copied"
      width={16}
      height={16}
      className="opacity-80"
    />
  </div>
)

export const OrderDetails = ({ order }: OrderDetailsProps) => {
  const [isCopied, setIsCopied] = useState(false)

  if (!order) return null

  const counterpartyNickname = order?.advert?.user?.id === USER.id 
    ? order?.user?.nickname 
    : order?.advert?.user?.nickname

  const counterpartyLabel = order?.type === "sell" 
    ? (order?.advert?.user?.id === USER.id ? "Seller" : "Buyer")
    : (order?.advert?.user?.id === USER.id ? "Buyer" : "Seller")

  const exchangeRateValue = order.exchange_rate?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.id)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy order ID:', error)
    }
  }

  return (
    <div className="space-y-[16px]" data-testid="order-details-container">
      <div data-testid="order-id-item">
        <h3 className="text-sm text-slate-500 mb-1">Order ID</h3>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold">{order.id}</p>
          {isCopied ? (
            <CopySuccessIcon />
          ) : (
            <button
              onClick={handleCopyOrderId}
              className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
              data-testid="copy-order-id-button"
              aria-label="Copy order ID"
            >
              <Image
                src="/icons/copy-icon.png"
                alt="Copy"
                width={16}
                height={16}
                className="opacity-60 hover:opacity-100"
              />
            </button>
          )}
        </div>
      </div>
      
      <OrderDetailItem
        label={`Exchange rate (${order.advert?.account_currency} 1)`}
        value={`${order.advert?.payment_currency} ${exchangeRateValue}`}
        testId="exchange-rate-item"
      />
      
      <OrderDetailItem
        label={order.type === "buy" ? "You pay" : "You receive"}
        value={`${order.advert?.payment_currency} ${formatAmount(order.payment_amount)}`}
        testId="payment-amount-item"
      />
      
      <OrderDetailItem
        label={order.type === "buy" ? "You receive" : "You send"}
        value={`${order.advert?.account_currency} ${formatAmount(order.amount)}`}
        testId="amount-item"
      />
      
      <OrderDetailItem
        label="Order time"
        value={formatDateTime(order.created_at)}
        testId="order-time-item"
      />
      
      <OrderDetailItem
        label={counterpartyLabel}
        value={counterpartyNickname || ''}
        testId="counterparty-item"
      />
    </div>
  )
}
