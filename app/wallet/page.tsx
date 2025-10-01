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
          <WalletSummary />
        </div>

        <div className="w-full mt-6 mx-4 md:mx-4 pl-6 pr-0 md:pl-0 md:pr-4">
          {displayBalances ? (
            <WalletBalances onBalanceClick={handleBalanceClick} />
          ) : (
            <div>
              <button
                onClick={handleBackToBalances}
                className="mb-4 text-sm text-[#181C25] hover:underline flex items-center gap-2"
              >
                ← Back to Balances
              </button>
              <h2 className="text-lg font-semibold mb-4">Transactions {selectedCurrency && `(${selectedCurrency})`}</h2>
              <TransactionsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
