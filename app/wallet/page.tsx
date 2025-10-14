"use client"

import { useState, useEffect, useCallback } from "react"
import { TransactionsTab } from "./components"
import WalletSummary from "./components/wallet-summary"
import WalletBalances from "./components/wallet-balances"
import { getTotalBalance } from "@/services/api/api-auth"

interface Balance {
  wallet_id: string
  amount: string
  currency: string
}

export default function WalletPage() {
  const [displayBalances, setDisplayBalances] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)
  const [totalBalance, setTotalBalance] = useState("0.00")
  const [balanceCurrency, setBalanceCurrency] = useState("USD")
  const [p2pBalances, setP2pBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBalanceData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getTotalBalance()
      const p2pWallet = data.wallets?.items?.find((wallet: any) => wallet.type === "p2p")

      if (p2pWallet) {
        setTotalBalance(p2pWallet.total_balance?.approximate_total_balance ?? "0.00")
        setBalanceCurrency(p2pWallet.total_balance?.converted_to ?? "USD")

        if (p2pWallet.balances) {
          const balancesList: Balance[] = p2pWallet.balances.map((wallet: any) => ({
            wallet_id: p2pWallet.id,
            amount: String(wallet.balance || "0"),
            currency: wallet.currency,
          }))
          setP2pBalances(balancesList)
        }
      }
    } catch (error) {
      console.error("Error fetching P2P wallet balance:", error)
      setTotalBalance("0.00")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBalanceData()
  }, [loadBalanceData])

  const handleBalanceClick = (currency: string, balance: string) => {
    setSelectedCurrency(currency)
    setTotalBalance(balance)
    setDisplayBalances(false)
  }

  const handleBackToBalances = () => {
    setDisplayBalances(true)
    setSelectedCurrency(null)
    setTotalBalance(null)
    loadBalanceData()
  }

  return (
    <div className="min-h-screen bg-background px-0 md:pl-[16px]">
      <div className="w-full flex flex-col items-center">
        <div className="w-full mt-0">
          <WalletSummary
            isBalancesView={displayBalances}
            selectedCurrency={selectedCurrency}
            onBack={handleBackToBalances}
            balance={totalBalance}
            currency={balanceCurrency}
            isLoading={isLoading}
          />
        </div>

        <div className="w-full mt-6 mx-4 md:mx-4 px-6 md:px-0">
          {displayBalances ? (
            <WalletBalances onBalanceClick={handleBalanceClick} balances={p2pBalances} isLoading={isLoading} />
          ) : (
            <TransactionsTab selectedCurrency={selectedCurrency} />
          )}
        </div>
      </div>
    </div>
  )
}
