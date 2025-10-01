"use client"

import { useEffect, useState } from "react"
import { getTotalBalance } from "@/services/api/api-auth"
import {formatAmount} from "@/lib/utils"

export function BalanceSection() {
  const [balance, setBalance] = useState<number>(0)
  const [currency, setCurrency] = useState<string>("")

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getTotalBalance()
        setBalance(data.total_balance.amount)
        setCurrency(data.total_balance.currency)
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      }
    }

    fetchBalance()
  }, [])

  return (
    <div className="mb-4 md:mb-6">
      <div className="text-white opacity-[0.72] text-xs mb-2">Est. total value</div>
      <div className="text-white text-xl font-bold">
        {`${formatAmount(balance?.toLocaleString() ?? "0")} ${currency}`}
      </div>
    </div>
  )
}
