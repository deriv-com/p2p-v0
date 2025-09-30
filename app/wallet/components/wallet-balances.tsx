"use client"

import { useEffect, useState } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import BalanceItem from "./balance-item"
import { Divider } from "@/components/ui/divider"

interface Balance {
  wallet_id: string
  amount: string
  currency: string
}

const currencyNames: Record<string, string> = {
  USD: "US Dollar",
  BTC: "Bitcoin",
  ETH: "Ethereum",
  LTC: "Litecoin",
  USDC: "USD Coin",
  eUSDT: "Tether ERC20",
  tUSDT: "Tether TRC20",
  BNB: "Binance Coin",
  AED: "UAE Dirham",
  USDT: "Tether",
  TRX: "Tron",
}

export default function WalletBalances() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const userId = useUserDataStore((state) => state.userId)

  useEffect(() => {
    const fetchUserBalances = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`
        const response = await fetch(url, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Branch": "master",
            "X-Data-Source": "live",
            accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`)
        }

        const responseData = await response.json()

        if (responseData?.data?.balances) {
          setBalances(responseData.data.balances)
        }
      } catch (error) {
        console.error("Error fetching balances:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserBalances()
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
    return <div className="flex items-center justify-center h-[200px] text-gray-500">No balances available</div>
  }

  return (
    <div className="w-full">
      {/* Mobile: Vertical layout */}
      <div className="md:hidden">
        {balances.map((balance, index) => (
          <div key={balance.wallet_id}>
            <BalanceItem
              currency={balance.currency}
              amount={balance.amount}
              currencyName={currencyNames[balance.currency]}
            />
            {index < balances.length - 1 && <Divider className="bg-[#00000014] h-[1px]" />}
          </div>
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-0">
        {balances.map((balance, index) => (
          <div key={balance.wallet_id} className="relative">
            <BalanceItem
              currency={balance.currency}
              amount={balance.amount}
              currencyName={currencyNames[balance.currency]}
            />
            {/* Vertical divider for grid items (not last in row) */}
            {(index + 1) % 3 !== 0 && index !== balances.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-[#00000014]" />
            )}
            {/* Horizontal divider for rows (not last row) */}
            {index < balances.length - 3 && (
              <Divider className="bg-[#00000014] h-[1px] absolute bottom-0 left-0 right-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
