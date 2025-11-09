"use client"

import { useState, useEffect, useCallback } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import { getTotalBalance } from "@/services/api/api-auth"

interface UseUserBalanceOptions {
  currency?: string
}

export function useUserBalance(options: UseUserBalanceOptions = {}) {
  const { currency: selectedCurrency } = options
  const userData = useUserDataStore((state) => state.userData)
  const [balance, setBalance] = useState<number>(0)
  const [currency, setCurrency] = useState<string>("USD")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const isV1Signup = userData?.signup === "v1"

  const fetchBalance = useCallback(async () => {
    if (!userData?.signup) {
      setBalance(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      if (isV1Signup) {
        const balances = userData?.balances || []

        if (selectedCurrency) {
          const accountBalance = balances.find((b: any) => b.currency === selectedCurrency)
          setBalance(Number.parseFloat(accountBalance?.amount || "0"))
          setCurrency(selectedCurrency)
        } else {
          const firstBalance = balances[0] || {}
          setBalance(Number.parseFloat(firstBalance.amount || "0"))
          setCurrency(firstBalance.currency || "USD")
        }
      } else {
        const data = await getTotalBalance()
        const p2pWallet = data.wallets?.items?.find((wallet: any) => wallet.type === "p2p")

        if (selectedCurrency && p2pWallet?.balances) {
          const accountBalance = p2pWallet.balances.find((b: any) => b.currency === selectedCurrency)
          setBalance(Number.parseFloat(accountBalance?.balance || "0"))
          setCurrency(selectedCurrency)
        } else {
          setBalance(0)
          setCurrency("USD")
        }
      }
    } catch (error) {
      console.error("Error fetching user balance:", error)
      setBalance(0)
    } finally {
      setIsLoading(false)
    }
  }, [isV1Signup, userData, selectedCurrency])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const updateBalance = useCallback((newBalance: number) => {
    setBalance(newBalance)
  }, [])

  return { balance, currency, isLoading, refetch: fetchBalance, updateBalance }
}
