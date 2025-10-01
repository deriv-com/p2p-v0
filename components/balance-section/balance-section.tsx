"use client"

import { useEffect, useState } from "react"
import { getTotalBalance } from "@/services/api/api-auth"

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

  const formattedBalance = balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className={`bg-slate-1200 p-6 rounded-3xl ${className}`}>
      <div className="text-slate-500 text-sm mb-2">Est. total value</div>
      <div className="text-white text-4xl font-bold">
        {isLoading ? (
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        ) : (
          `${formattedBalance} ${currency}`
        )}
      </div>
    </div>
  )
}
