"use client"

import { useEffect, useState } from "react"
import { getTotalBalance } from "@/services/api/api-auth"
import { formatAmount } from "@/lib/utils"

export function BalanceSection() {
  const [balance, setBalance] = useState<string>("0.00")
  const [currency, setCurrency] = useState<string>("")

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getTotalBalance()
        const p2pWallet = data.wallets?.items?.find((wallet: any) => wallet.type === "p2p")

        if (p2pWallet?.balances?.length) {
          const p2pBalance = p2pWallet.balances[0]
          setBalance(p2pBalance.balance)
          setCurrency(p2pBalance.currency)
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      }
    }

    fetchBalance()
  }, [])

  return (
    <div className="mb-4">
      <div className="text-white opacity-[0.72] text-xs mb-2">Est. total value</div>
      <div className="text-white text-xl font-bold">{`${formatAmount(balance)} ${currency}`}</div>
    </div>
  )
}
