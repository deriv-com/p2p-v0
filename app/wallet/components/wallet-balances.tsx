"use client"

import { useEffect, useState } from "react"
import BalanceItem from "./balance-item"
import { fetchUserBalances } from "@/services/api/api-wallets"
import { useUserDataStore } from "@/stores/user-data-store"
import Image from "next/image"

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
    return <div className="flex items-center justify-center h-[200px] text-gray-500">Loading</div>
  }

  if (balances.length === 0) {
    return (
      <div className="flex flex-col items-center p-6 md:mt-6 mr-6 md:mr-0">
        <Image src="/icons/magnifier.png" alt="No assets" width={86} height={86} />
        <div className="h-2" />
        <p
          style={{
            color: "#181C25",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          No assets yet
        </p>
        <div className="h-1" />
        <p
          style={{
            color: "#000000B8",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 400,
          }}
        >
          Make your first deposit and begin your trading journey today
        </p>
      </div>
    )
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
