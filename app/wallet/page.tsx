"use client"

import { useState } from "react"
import { TransactionsTab } from "./components"
import WalletSummary from "./components/wallet-summary"
import WalletBalances from "./components/wallet-balances"

export default function WalletPage() {
  const [displayBalances, setDisplayBalances] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)

  const handleBalanceClick = (currency: string) => {
    setSelectedCurrency(currency)
    setDisplayBalances(false)
  }

  const handleBackToBalances = () => {
    setDisplayBalances(true)
    setSelectedCurrency(null)
  }

  return (
    <div className="min-h-screen bg-background px-0 md:pl-[16px]">
      <div className="w-full flex flex-col items-center">
        <div className="w-full mt-0">
          <WalletSummary
            isBalancesView={displayBalances}
            selectedCurrency={selectedCurrency}
            onBack={handleBackToBalances}
          />
        </div>

        <div className="w-full mt-6 mx-4 md:mx-4 pl-6 pr-0 md:pl-0 ">
          {displayBalances ? <WalletBalances onBalanceClick={handleBalanceClick} /> : <TransactionsTab />}
        </div>
      </div>
    </div>
  )
}
