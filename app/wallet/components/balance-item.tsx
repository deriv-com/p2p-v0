"use client"

import Image from "next/image"
import { currencyLogoMapper } from "@/lib/utils"

interface BalanceItemProps {
  currency: string
  amount: string
  onClick?: () => void
}

export default function BalanceItem({ currency, amount, onClick }: BalanceItemProps) {
  const logo = currencyLogoMapper[currency as keyof typeof currencyLogoMapper]

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between h-[72px] w-full md:w-[444px] cursor-pointer transition-colors relative"
    >
  
      <div className="flex items-center gap-4 pl-0">
        <div className="flex-shrink-0">
          {logo ? (
            <Image
              src={logo}
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

        <div className="text-slate-1200 text-base font-normal">{currency}</div>
      </div>

  
      <div className="text-slate-1200 text-base font-normal pr-6">
        {Number(amount).toFixed(2)} {currency}
      </div>

  
      <div className="absolute bottom-0 left-10 right-0 h-[1px] bg-grayscale-200" />
    </div>
  )
}
