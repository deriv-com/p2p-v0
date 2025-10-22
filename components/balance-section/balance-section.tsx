"use client"

import { useEffect, useState } from "react"
import { getTotalBalance } from "@/services/api/api-auth"
import { formatAmountWithDecimals } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserDataStore } from "@/stores/user-data-store"

interface BalanceSectionProps {
  isV1Signup?: boolean
  className?: string
}

export function BalanceSection({ isV1Signup = false, className }: BalanceSectionProps) {
  const [balance, setBalance] = useState<string>("0.00")
  const [currency, setCurrency] = useState<string>("USD")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const userData = useUserDataStore((state) => state.userData)

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true)
      try {
        if (isV1Signup) {
          const balances = userData?.balances || []
          const firstBalance = balances[0] || {}
          setBalance(firstBalance.amount || "0.00")
          setCurrency(firstBalance.currency || "USD")
        } else {
          // For other users, use existing getTotalBalance logic
          const data = await getTotalBalance()
          const p2pWallet = data.wallets?.items?.find((wallet: any) => wallet.type === "p2p")

          setBalance(p2pWallet?.total_balance?.approximate_total_balance ?? "0.00")
          setCurrency(p2pWallet?.total_balance?.converted_to ?? "USD")
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [isV1Signup, userData])

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
