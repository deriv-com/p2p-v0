"use client"

import { formatAmountWithDecimals } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface BalanceSectionProps {
  balance: string
  currency: string
  isLoading: boolean
  className?: string
}

export function BalanceSection({ balance, currency, isLoading, className }: BalanceSectionProps) {
  return (
    <div className={className || "mb-4"}>
      <div className="text-white opacity-[0.72] text-xs mb-2">Est. total value</div>
      {isLoading ? (
        <Skeleton className="h-7 w-32 bg-white/20" />
      ) : (
        <div className="text-white text-xl font-bold">{`${formatAmountWithDecimals(balance)} ${currency}`}</div>
      )}
    </div>
  )
}
