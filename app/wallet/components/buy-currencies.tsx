"use client"

import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"
import { currencyLogoMapper } from "@/lib/utils"
import { useAccountCurrencies } from "@/hooks/use-account-currencies"
import { Skeleton } from "@/components/ui/skeleton"

interface CurrencyCardProps {
  code: string
}

function CurrencyCard({ code }: CurrencyCardProps) {
  const logo = currencyLogoMapper[code as keyof typeof currencyLogoMapper]

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-grayscale-400 hover:bg-grayscale-300 transition-colors cursor-pointer">
      <div className="w-12 h-12 flex items-center justify-center">
        {logo ? (
          <Image
            src={logo}
            alt={code}
            width={48}
            height={48}
            className="w-full h-full rounded-full object-contain"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
            {code.slice(0, 2)}
          </div>
        )}
      </div>
      <span className="text-slate-1200 text-sm font-normal text-center">{code}</span>
    </div>
  )
}

function CurrencyCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-grayscale-400">
      <Skeleton className="w-12 h-12 rounded-full bg-grayscale-500" />
      <Skeleton className="w-full h-4 bg-grayscale-500" />
    </div>
  )
}

export default function BuyCurrencies() {
  const { t } = useTranslations()
  const { accountCurrencies, isLoading } = useAccountCurrencies()

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-slate-1200 text-xl font-bold mb-6">{t("wallet.buyCurrenciesTitle") || "Buy currencies to get started"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <CurrencyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-slate-1200 text-xl font-bold mb-6">{t("wallet.buyCurrenciesTitle") || "Buy currencies to get started"}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {accountCurrencies.map((currency) => (
          <CurrencyCard key={currency.code} code={currency.code} />
        ))}
      </div>
    </div>
  )
}
