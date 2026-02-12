"use client"

import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"
import { currencyLogoMapper } from "@/lib/utils"

interface Currency {
  code: string
  label: string
}

const AVAILABLE_CURRENCIES: Currency[] = [
  { code: "USD", label: "US Dollar" },
  { code: "BTC", label: "Bitcoin" },
  { code: "ETH", label: "Ethereum" },
  { code: "LTC", label: "Litecoin" },
  { code: "USDC", label: "USD Coin" },
  { code: "eUSDT", label: "USDT (Tron)" },
  { code: "TRX", label: "Tron" },
  { code: "BNB", label: "BNB" },
]

interface CurrencyCardProps {
  currency: Currency
}

function CurrencyCard({ currency }: CurrencyCardProps) {
  const logo = currencyLogoMapper[currency.code as keyof typeof currencyLogoMapper]

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-grayscale-400 hover:bg-grayscale-300 transition-colors cursor-pointer">
      <div className="w-12 h-12 flex items-center justify-center">
        {logo ? (
          <Image
            src={logo}
            alt={currency.label}
            width={48}
            height={48}
            className="w-full h-full rounded-full object-contain"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
            {currency.code.slice(0, 2)}
          </div>
        )}
      </div>
      <span className="text-slate-1200 text-sm font-normal text-center">{currency.label}</span>
    </div>
  )
}

export default function BuyCurrencies() {
  const { t } = useTranslations()

  return (
    <div className="w-full">
      <h2 className="text-slate-1200 text-xl font-bold mb-6">{t("wallet.buyCurrenciesTitle") || "Buy currencies to get started"}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {AVAILABLE_CURRENCIES.map((currency) => (
          <CurrencyCard key={currency.code} currency={currency} />
        ))}
      </div>
    </div>
  )
}
