"use client"
import { useEffect } from "react"
import { formatAmountWithDecimals } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useUserBalance } from "@/hooks/use-user-balance"
import { useWebSocketContext } from "@/contexts/websocket-context"
import { useUserDataStore } from "@/stores/user-data-store"

interface BalanceSectionProps {
  className?: string
}

export function BalanceSection({ className }: BalanceSectionProps) {
  const { t } = useTranslations()
  const { balance, currency, isLoading, updateBalance } = useUserBalance()
  const { subscribeToUserUpdates, unsubscribeFromUserUpdates, addMessageHandler } = useWebSocketContext()
  const userData = useUserDataStore((state) => state.userData)
  const isV1Signup = userData?.signup === "v1"

  useEffect(() => {
    if (!isV1Signup) return

    console.log("[v0] BalanceSection: Subscribing to users/me channel for balance updates")

    subscribeToUserUpdates()

    const handleMessage = (data: any) => {
      console.log("[v0] BalanceSection: Received WebSocket message:", data)

      if (data.options?.channel === "users/me" && data.event === "balance_change") {
        console.log("[v0] BalanceSection: Balance change detected, updating balance")
        const newBalances = data.payload?.balances || []
        if (newBalances.length > 0) {
          const newBalance = Number.parseFloat(newBalances[0]?.amount || "0")
          updateBalance(newBalance)
        }
      }
    }

    addMessageHandler(handleMessage)

    return () => {
      console.log("[v0] BalanceSection: Unsubscribing from users/me channel")
      unsubscribeFromUserUpdates()
    }
  }, [isV1Signup, subscribeToUserUpdates, unsubscribeFromUserUpdates, addMessageHandler, updateBalance])

  return (
    <div className={className || "mb-4"}>
      <div className="text-white opacity-[0.72] text-xs mb-2">{t("wallet.estTotalValue")}</div>
      {isLoading ? (
        <Skeleton className="h-7 w-32 bg-white/20" />
      ) : (
        <div className="text-white text-xl font-bold">{`${formatAmountWithDecimals(balance)} ${currency}`}</div>
      )}
    </div>
  )
}
