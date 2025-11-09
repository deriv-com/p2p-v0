"use client"

import { useState, useEffect, useCallback } from "react"
import { formatAmountWithDecimals } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useUserDataStore } from "@/stores/user-data-store"
import { getTotalBalance } from "@/services/api/api-auth"
import { useWebSocketContext } from "@/contexts/websocket-context"

interface BalanceSectionProps {
  className?: string
}

export function BalanceSection({ className }: BalanceSectionProps) {
  const { t } = useTranslations()
  const { subscribe, isConnected, subscribeToUserUpdates, unsubscribeFromUserUpdates } = useWebSocketContext()
  const userData = useUserDataStore((state) => state.userData)

  const [balance, setBalance] = useState<string>("0.00")
  const [currency, setCurrency] = useState<string>("USD")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const isV1Signup = userData?.signup === "v1"

  const fetchBalance = useCallback(async () => {
    if (!userData?.signup) {
      return
    }

    setIsLoading(true)

    try {
      if (isV1Signup) {
        const balances = userData?.balances || []
        const firstBalance = balances[0] || {}
        setBalance(firstBalance.amount || "0.00")
        setCurrency(firstBalance.currency || "USD")
      } else {
        const data = await getTotalBalance()
        const p2pWallet = data.wallets?.items?.find((wallet: any) => wallet.type === "p2p")

        setBalance(p2pWallet?.total_balance?.approximate_total_balance ?? "0.00")
        setCurrency(p2pWallet?.total_balance?.converted_to ?? "USD")
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      setBalance("0.00")
      setCurrency("USD")
    } finally {
      setIsLoading(false)
    }
  }, [isV1Signup, userData])

  useEffect(() => {
    if (!isV1Signup || !isConnected) return

    console.log("[v0] BalanceSection: Subscribing to users/me channel for balance updates")

    // Subscribe to WebSocket messages
    const unsubscribe = subscribe((data: any) => {
      console.log("[v0] BalanceSection received WebSocket message:", data)

      // Listen for balance_change event on users/me channel
      if (data.event === "balance_change" && data.options?.channel === "users/me") {
        console.log("[v0] Balance change event detected:", data.payload)

        // Update balance from the payload
        if (data.payload?.balances && Array.isArray(data.payload.balances)) {
          const firstBalance = data.payload.balances[0] || {}
          if (firstBalance.amount) {
            setBalance(firstBalance.amount)
            console.log("[v0] Updated balance to:", firstBalance.amount)
          }
          if (firstBalance.currency) {
            setCurrency(firstBalance.currency)
          }
        }
      }
    })

    // Join and subscribe to users/me channel
    subscribeToUserUpdates()

    return () => {
      console.log("[v0] BalanceSection: Unsubscribing from users/me channel")
      unsubscribe()
      unsubscribeFromUserUpdates()
    }
  }, [isV1Signup, isConnected, subscribe])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

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
