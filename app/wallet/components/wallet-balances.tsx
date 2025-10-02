"use client"

import { useEffect, useState } from "react"
import BalanceItem from "./balance-item"
import { fetchUserBalances } from "@/services/api/api-wallets"
import { useUserDataStore } from "@/stores/user-data-store"

interface Balance {
  wallet_id: string
  amount: string
  currency: string
}

interface WalletBalancesProps {
  onBalanceClick?: (currency: string) => void
}

export default function WalletBalances({ onBalanceClick }: WalletBalancesProps) {
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const userId = useUserDataStore((state) => state.userId)

  useEffect(() => {
    const loadBalances = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const data = await fetchUserBalances()
        if (data?.balances) {
          setBalances(data.balances)
        }
      } catch (error) {
        console.error("Error fetching balances:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBalances()
  }, [userId])

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-[72px] bg-gray-200 rounded"></div>
          <div className="h-[72px] bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (balances.length === 0) {
    return <div className="flex items-center justify-center h-[200px] text-gray-500">Loading available balances</div>
  }

  return (
    <div className="w-full">
      <div className="md:hidden flex flex-col">
        {balances.map((balance) => (
          <BalanceItem
            key={balance.wallet_id}
            currency={balance.currency}
            amount={balance.amount}
            onClick={() => onBalanceClick?.(balance.currency)}
          />
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-0">
        {balances.map((balance) => (
          <BalanceItem
            key={balance.wallet_id}
            currency={balance.currency}
            amount={balance.amount}
            onClick={() => onBalanceClick?.(balance.currency)}
          />
        ))}
      </div>
    </div>
  )
}
