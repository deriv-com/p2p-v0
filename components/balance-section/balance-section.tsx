"use client"

import { formatAmountWithDecimals } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import { getTotalBalance } from "@/services/api/api-auth"
import { useWebSocketContext } from "@/contexts/websocket-context"
import type { BalanceUpdateMessage } from "@/lib/websocket-message"

interface BalanceSectionProps {
  className?: string
}

export function BalanceSection({ className }: BalanceSectionProps) {
  const { t } = useTranslations()

  const [balance, setBalance] = useState<string>("0.00")
  const [balanceCurrency, setBalanceCurrency] = useState<string>("USD")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const fetchedForRef = useRef<string | null>(null)

  const userData = useUserDataStore((state) => state.userData)
  const { subscribe } = useWebSocketContext()

  const isV1Signup = userData?.signup === "v1"

  const balancesKey = useMemo(() => {
    if (!userData?.signup) return null

    if (isV1Signup) {
      const balances = userData?.balances || []
      if (balances.length === 0) return "v1-empty"
      return `v1-${balances[0]?.amount || "0"}-${balances[0]?.currency || "USD"}`
    }
    return "v2"
  }, [isV1Signup, userData?.balances, userData?.signup])

  useEffect(() => {
    if (!isV1Signup) {
      return
    }

    const unsubscribe = subscribe((message: BalanceUpdateMessage) => {
      if (message.action === "balance_updated" && message.payload?.balances) {
        const updatedBalances = message.payload.balances
        const firstBalance = updatedBalances[0] || {}

        setBalance(firstBalance.amount || "0.00")
        setBalanceCurrency(firstBalance.currency || "USD")

        useUserDataStore.getState().updateUserData({
          balances: updatedBalances,
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [isV1Signup, subscribe])

  const fetchBalance = useCallback(async () => {
    if (!userData?.signup) {
      setIsLoading(false)
      return
    }

    if (!userData) {
      return
    }

    if (isV1Signup && !userData?.balances) {
      return
    }

    if (fetchedForRef.current === balancesKey) {
      return
    }

    fetchedForRef.current = balancesKey
    setIsLoading(true)

    try {
      if (isV1Signup) {
        const balances = userData?.balances || []
        const firstBalance = balances[0] || {}
        setBalance(firstBalance.amount || "0.00")
        setBalanceCurrency(firstBalance.currency || "USD")
      } else {
        const data = await getTotalBalance()
        const p2pWallet = data.wallets?.items?.find((wallet: any) => wallet.type === "p2p")

        setBalance(p2pWallet?.total_balance?.approximate_total_balance ?? "0.00")
        setBalanceCurrency(p2pWallet?.total_balance?.converted_to ?? "USD")
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      setBalance("0.00")
      setBalanceCurrency("USD")
    } finally {
      setIsLoading(false)
    }
  }, [balancesKey, isV1Signup, userData])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return (
    <div className={className || "mb-4"}>
      <div className="text-white opacity-[0.72] text-xs mb-2">{t("wallet.estTotalValue")}</div>
      {isLoading ? (
        <Skeleton className="h-7 w-32 bg-white/20" />
      ) : (
        <div className="text-white text-xl font-bold">{`${formatAmountWithDecimals(balance)} ${balanceCurrency}`}</div>
      )}
    </div>
  )
}
