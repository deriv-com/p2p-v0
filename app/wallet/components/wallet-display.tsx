"use client"

import Image from "next/image"
import { currencyLogoMapper } from "@/lib/utils"

interface WalletDisplayProps {
  name: string
  amount: string
  currency: string
  onClick?: () => void
  isSelected?: boolean
}

const getCurrencyImage = (walletName: string, currency: string) => {
  if (walletName === "P2P Wallet") {
    return "/icons/p2p-logo.png"
  }
  return currencyLogoMapper[currency as keyof typeof currencyLogoMapper]
}

export default function WalletDisplay({ name, amount, currency, onClick, isSelected }: WalletDisplayProps) {
  return (
    <div
      className={`min-h-[56px] px-4 py-2 flex items-center self-stretch rounded-lg bg-grayscale-500 cursor-pointer hover:bg-gray-100 transition-colors ${
        isSelected ? "border border-black" : ""
      }`}
      onClick={onClick}
    >
      <div className="w-8 h-8 flex-shrink-0">
        <Image
          src={getCurrencyImage(name, currency) }
          alt={name}
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>

      <div className="flex-1 ml-4">
        <h3 className="text-slate-600 text-base font-normal">{name}</h3>
        <p className="text-grayscale-text-muted text-sm font-normal">
          {amount} {currency}
        </p>
      </div>

      <div className="ml-4">
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            isSelected ? "border-black bg-black" : "border-gray-300"
          }`}
        >
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
    </div>
  )
}
