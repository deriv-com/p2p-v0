"use client"

import { useState } from "react"
import { TransactionsTab } from "./components"
import WalletSummary from "./components/wallet-summary"
import WalletBalances from "./components/wallet-balances"

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"wallet" | "transactions">("wallet")

  return (
    <div className="min-h-screen bg-background px-0 md:pl-[16px]">
      <div className="w-full flex flex-col items-center">
        <div className="w-full mt-0">
          <WalletSummary />
        </div>

        <div className="w-full mt-6 mx-4 md:mx-4 mt-6 px-4">
          {/* Tabs */}
          <div className="flex gap-0 h-10 bg-[#0000000A] rounded-lg p-1 mb-4 md:w-[358px] md:mb-6">
            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex-1 h-full rounded-md transition-colors text-sm font-normal ${
                activeTab === "wallet"
                  ? "bg-white text-[#181C25] shadow-sm"
                  : "bg-transparent text-[#181C25] hover:text-[#181C25]"
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 h-full rounded-md transition-colors text-sm font-normal ${
                activeTab === "transactions"
                  ? "bg-white text-[#181C25] shadow-sm"
                  : "bg-transparent text-[#181C25] hover:text-[#181C25]"
              }`}
            >
              Transactions
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "wallet" ? (
            <WalletBalances />
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Transactions</h2>
              <TransactionsTab />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
