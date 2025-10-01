"use client"

import { useEffect, useState } from "react"
import { getTotalBalance } from "@/services/api/api-auth"
import {formatAmount} from "@/lib/utils"

interface BalanceSectionProps {
  className?: string
}

export function BalanceSection({ className = "" }: BalanceSectionProps) {
  const [balance, setBalance] = useState<number>(0)
  const [currency, setCurrency] = useState<string>("USD")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true)
        const data = await getTotalBalance()
        setBalance(data.balance)
        setCurrency(data.currency)
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [])

  return (
    <div className={` p-6 ${className}`}>
      <div className="text-slate-500 text-sm mb-2">Est. total value</div>
      <div className="text-white text-4xl font-bold">
        {isLoading ? (
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        ) : (
          `${formatAmount(balance?.toLocaleString() ?? "0")} ${currency}`
        )}
      </div>
    </div>
  )
}
