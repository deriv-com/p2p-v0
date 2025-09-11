"use client"

import Image from "next/image"

interface WalletDisplayProps {
  name: string
  amount: string
  currency: string
  icon: string
  onClick?: () => void
  isSelected?: boolean
}

export default function WalletDisplay({ name, amount, currency, icon, onClick, isSelected }: WalletDisplayProps) {
  return (
    <div
      className={`min-h-[56px] px-4 py-2 flex items-center self-stretch rounded-lg bg-grayscale-700 cursor-pointer hover:bg-gray-100 transition-colors ${
        isSelected ? "border border-black" : "border border-black/[0.04]"
      }`}
      onClick={onClick}
    >
      <div className="w-8 h-8 flex-shrink-0">
        <Image src={icon } alt={name} width={32} height={32} className="rounded-full" />
      </div>

      <div className="flex-1 ml-4">
        <h3 className="text-black/[0.72] text-base font-normal">{name}</h3>
        <p className="text-black/[0.48] text-sm font-normal">
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
