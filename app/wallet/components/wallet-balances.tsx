"use client"

import Image from "next/image"
import BalanceItem from "./balance-item"
import { useTranslations } from "@/lib/i18n/use-translations"

interface Balance {
  amount: string
  currency: string
  label: string
}

interface WalletBalancesProps {
  onBalanceClick?: (currency: string, amount: string) => void
  balances?: Balance[]
  isLoading?: boolean
}

export default function WalletBalances({ onBalanceClick, balances = [], isLoading = true }: WalletBalancesProps) {
  const { t } = useTranslations()

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="mt-2 text-slate-600">{t("wallet.loadingAssets")}</p>
      </div>
    )
  }

  if (balances.length === 0) {
    return (
      <EmptyState title={t("wallet.noAssetsTitle")} description={t("wallet.noAssetsDescription")} />
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
        {balances
          .filter((wallet) => wallet.currency === "USD")
          .map((wallet) => (
            <BalanceItem
              key={wallet.currency}
              currency={wallet.currency}
              amount={wallet.amount}
              label={`P2P ${wallet.label}`}
              onClick={() => onBalanceClick?.(wallet.currency, wallet.amount)}
            />
          ))}
      </div>
    </div>
  )
}
