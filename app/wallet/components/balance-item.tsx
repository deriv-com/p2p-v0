"use client"

import Image from "next/image"
import { currencyLogoMapper } from "@/lib/utils"

interface BalanceItemProps {
  currency: string
  amount: string
  currencyName?: string
}

export default function BalanceItem({ currency, amount, currencyName }: BalanceItemProps) {
  const logo = currencyLogoMapper[currency as keyof typeof currencyLogoMapper]

  return (
    <div className="flex items-center gap-3 h-[72px] pr-4 pl-0">
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

      <div className="flex flex-col gap-1">
        <div className="text-[#181C25] text-base font-normal">
          {Number(amount).toFixed(2)} {currency}
        </div>
        <div className="text-[#0000007A] text-xs font-normal">{currencyName || currency}</div>
      </div>
    </div>
  )
}
