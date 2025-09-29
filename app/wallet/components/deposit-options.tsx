"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DepositOptionProps {
  onClose: () => void
  onDirectDepositClick: (currency: string) => void
  currencies: Currency[]
  selectedCurrency: string
}

interface Currency {
  code: string
  name: string
  logo: string
}

export default function DepositOptions({
  onClose,
  onDirectDepositClick,
  currencies,
  selectedCurrency,
}: DepositOptionProps) {
  const router = useRouter()
  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency) || currencies[0]

  const handleDirectDepositClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onDirectDepositClick(selectedCurrency)
  }

  const handleP2PTradingClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    router.push("/")
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex p-4 justify-center items-center gap-4 self-stretch",
          "rounded-2xl bg-slate-75 cursor-pointer hover:bg-accent/80",
        )}
        onClick={handleP2PTradingClick}
      >
        <div className="flex-shrink-0 w-12 h-12 bg-slate-75 rounded-full flex items-center justify-center">
          <Image src="/icons/up-down-arrows.png" alt="Trade" width={48} height={48} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-normal text-slate-1200 leading-6 mb-1">P2P Trading</h3>
          <p className="text-grayscale-text-muted text-xs font-normal leading-[22px]">
            {`Buy ${selectedCurrencyData?.name} directly from other users on the P2P marketplace.`}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex p-4 justify-center items-center gap-4 self-stretch",
          "rounded-2xl bg-slate-75 cursor-pointer hover:bg-accent/80",
        )}
        onClick={handleDirectDepositClick}
      >
        <div className="flex-shrink-0 w-12 h-12 bg-slate-75 rounded-full flex items-center justify-center">
          <Image src="/icons/bank-icon.png" alt="Bank" width={48} height={48} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-normal text-[#181C25] leading-6 mb-1">Direct deposit</h3>
          <p className="text-grayscale-text-muted text-xs font-normal leading-[22px]">
            Deposit funds directly from your bank account, e-wallet, or other payment methods.
          </p>
        </div>
      </div>
    </div>
  )
}
