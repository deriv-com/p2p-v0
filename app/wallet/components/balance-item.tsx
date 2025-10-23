"use client"

import Image from "next/image"
import { currencyLogoMapper, formatAmountWithDecimals } from "@/lib/utils"

interface BalanceItemProps {
  currency: string
  amount: string
  label?: string
  onClick?: () => void
}

export default function BalanceItem({ currency, amount, label, onClick }: BalanceItemProps) {
  const logo = currencyLogoMapper[currency as keyof typeof currencyLogoMapper]

  const displayAmount = isNaN(Number(amount)) ? "0.00" : formatAmountWithDecimals(amount)

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between h-[72px] w-full cursor-pointer transition-colors relative"
    >
      <div className="flex items-center gap-4 pl-0">
        <div className="flex-shrink-0">
          {logo ? (
            <Image
              src={logo || "/placeholder.svg"}
              alt={`${currency} logo`}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-contain"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
              {currency.charAt(0)}
            </div>
          )}
        </div>

        <div className="text-slate-1200 text-base font-normal">{label || currency}</div>
      </div>

      <div className="text-slate-1200 text-base font-normal pr-6">
        {displayAmount} {currency}
      </div>

      <div className="absolute bottom-0 left-10 right-0 h-[1px] bg-grayscale-200" />
    </div>
  )
}
