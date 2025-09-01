"use client"

import Image from "next/image"

interface WalletDisplayProps {
  name: string
  amount: string
  currency: string
  icon: string
  onClick?: () => void
}

export default function WalletDisplay({ name, amount, currency, icon, onClick }: WalletDisplayProps) {
  return (
    <div
      className="min-h-[56px] px-6 py-2 flex items-center gap-4 self-stretch rounded-lg border border-black/[0.04] bg-[#EFF3F5] cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      <div className="w-8 h-8 flex-shrink-0">
        <Image src={icon || "/placeholder.svg"} alt={name} width={32} height={32} className="rounded-full" />
      </div>
      <div className="flex-1">
        <h3 className="text-black/[0.72] text-base font-normal">{name}</h3>
        <p className="text-black/[0.48] text-sm font-normal">
          {amount} {currency}
        </p>
      </div>
    </div>
  )
}
