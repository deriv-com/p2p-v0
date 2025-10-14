"use client"

import Image from "next/image"
import BalanceItem from "./balance-item"

interface Balance {
  amount: string
  currency: string
}

interface WalletBalancesProps {
  onBalanceClick?: (currency: string, amount: string) => void
  balances?: Balance[]
  isLoading?: boolean
}

export default function WalletBalances({ onBalanceClick, balances = [], isLoading = true }: WalletBalancesProps) {
  if (isLoading) {
    return (<div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="mt-2 text-slate-600">Loading assets...</p>
        </div>)
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
      <div className="flex flex-col md:grid md:grid-col-2 gap-4">
        {balances.map((wallet) => (
          <BalanceItem
            key={wallet.currency}
            currency={wallet.currency}
            amount={wallet.amount}
            onClick={() => onBalanceClick?.(wallet.currency, wallet.amount)}
          />
        ))}
      </div>
    </div>
  )
}
