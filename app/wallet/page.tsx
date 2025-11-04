"use client"

import { useState, useEffect, useCallback } from "react"
import { TransactionsTab } from "./components"
import WalletSummary from "./components/wallet-summary"
import WalletBalances from "./components/wallet-balances"
import { getTotalBalance } from "@/services/api/api-auth"
import { getCurrencies } from "@/services/api/api-wallets"
import { TemporaryBanAlert } from "@/components/temporary-ban-alert"
import { useUserDataStore } from "@/stores/user-data-store"
import { P2PAccessRemoved } from "@/components/p2p-access-removed"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface Balance {
  wallet_id: string
  amount: string
  currency: string
  label: string
}

export default function WalletPage() {
  const router = useRouter()
  const [displayBalances, setDisplayBalances] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>("USD")
  const [totalBalance, setTotalBalance] = useState("0.00")
  const [balanceCurrency, setBalanceCurrency] = useState("USD")
  const [p2pBalances, setP2pBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currenciesData, setCurrenciesData] = useState<Record<string, any>>({})
  const [hasCheckedSignup, setHasCheckedSignup] = useState(false)
  const { userData } = useUserDataStore()
  const tempBanUntil = userData?.temp_ban_until
  const isDisabled = userData?.status === "disabled"

  const loadBalanceData = useCallback(async () => {
    setIsLoading(true)
    try {
      const currenciesResponse = await getCurrencies()
      const currencies = currenciesResponse?.data || {}
      setCurrenciesData(currencies)

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
            label: currencies[wallet.currency]?.label || wallet.currency,
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
    if (userData?.signup === "v1") {
      router.push("/")
    } else if (userData?.signup !== undefined) {
      setHasCheckedSignup(true)
    }
  }, [userData?.signup, router])

  useEffect(() => {
    loadBalanceData()
  }, [loadBalanceData])

  if (!hasCheckedSignup && userData?.signup === undefined) {
    return (
      <div className="min-h-screen bg-background px-0 md:pl-[16px]">
        <div className="w-full flex flex-col items-center">
          {/* Wallet Summary Skeleton */}
          <div className="w-full mt-0">
            <div className="w-full p-6 flex flex-col bg-slate-1200 md:h-[140px] h-auto rounded-b-3xl md:rounded-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-18 h-18 md:w-24 md:h-24 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24 bg-white/20" />
                    <Skeleton className="h-7 w-32 bg-white/20" />
                  </div>
                </div>
                <div className="flex items-center gap-[66px] px-[33px]">
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
                    <Skeleton className="h-3 w-12 bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balances Skeleton */}
          <div className="w-full mt-6 mx-4 md:mx-4 px-6 md:px-0">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (userData?.signup === "v1") {
    return null
  }

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

  if (isDisabled) {
    return (
      <div className="flex flex-col h-screen overflow-hidden px-3">
        <P2PAccessRemoved />
      </div>
    )
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
        {tempBanUntil && (
          <div className="w-full px-4 md:px-0 mt-4">
            <TemporaryBanAlert tempBanUntil={tempBanUntil} />
          </div>
        )}
        <div className="w-full mt-6 mx-4 md:mx-4 px-6 md:px-0">
          {displayBalances ? (
            <WalletBalances onBalanceClick={handleBalanceClick} balances={p2pBalances} isLoading={isLoading} />
          ) : (
            <TransactionsTab selectedCurrency={selectedCurrency} currencies={currenciesData} />
          )}
        </div>
      </div>
    </div>
  )
}
