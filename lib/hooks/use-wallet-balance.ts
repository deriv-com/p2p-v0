"use client"

import useSWR from "swr"
import { getTotalBalance, getCurrencies } from "@/services/api"

interface WalletBalance {
  wallet_id: string
  amount: string
  currency: string
  label: string
}

interface WalletData {
  totalBalance: string
  balanceCurrency: string
  p2pBalances: WalletBalance[]
  currenciesData: Record<string, any>
}

export function useWalletBalance() {
  const fetcher = async () => {
    const [balanceData, currenciesResponse] = await Promise.all([
      getTotalBalance(),
      getCurrencies(),
    ])

    const currencies = currenciesResponse?.data || {}
    const p2pWallet = balanceData.wallets?.items?.find((wallet: any) => wallet.type === "p2p")

    const totalBalance = p2pWallet?.total_balance?.approximate_total_balance ?? "0.00"
    const balanceCurrency = p2pWallet?.total_balance?.converted_to ?? "USD"

    const p2pBalances: WalletBalance[] = (p2pWallet?.balances || []).map((wallet: any) => ({
      wallet_id: p2pWallet.id,
      amount: String(wallet.balance || "0"),
      currency: wallet.currency,
      label: currencies[wallet.currency]?.label || wallet.currency,
    }))

    return {
      totalBalance,
      balanceCurrency,
      p2pBalances,
      currenciesData: currencies,
    }
  }

  const { data, error, isLoading, mutate } = useSWR<WalletData>("wallet-balance", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 120000, // 2 minutes deduping interval
    focusThrottleInterval: 300000, // 5 minutes focus throttle
  })

  return {
    totalBalance: data?.totalBalance || "0.00",
    balanceCurrency: data?.balanceCurrency || "USD",
    p2pBalances: data?.p2pBalances || [],
    currenciesData: data?.currenciesData || {},
    isLoading,
    error: error?.message || null,
    mutate,
  }
}
