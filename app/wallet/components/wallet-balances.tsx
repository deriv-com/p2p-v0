"use client"

import { useEffect, useState } from "react"
import BalanceItem from "./balance-item"
import { fetchUserBalances } from "@/services/api/api-wallets"

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

  useEffect(() => {
    const loadBalances = async () => {
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
  }, [])

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
    return <div className="flex items-center justify-center h-[200px] text-gray-500">No balances available</div>
  }

  return (
    <div className="w-full">
      {/* Mobile: Vertical layout */}
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

      {/* Desktop: Grid layout */}
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
