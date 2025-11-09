"use client"
import { formatAmountWithDecimals } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useUserBalance } from "@/hooks/use-user-balance"

interface BalanceSectionProps {
  className?: string
}

export function BalanceSection({ className }: BalanceSectionProps) {
  const { t } = useTranslations()
  const { balance, currency, isLoading } = useUserBalance()

  return (
    <div className={className || "mb-4"}>
      <div className="text-white opacity-[0.72] text-xs mb-2">{t("wallet.estTotalValue")}</div>
      {isLoading ? (
        <Skeleton className="h-7 w-32 bg-white/20" />
      ) : (
        <div className="text-white text-xl font-bold">{`${formatAmountWithDecimals(balance)} ${currency}`}</div>
      )}
    </div>
  )
}
