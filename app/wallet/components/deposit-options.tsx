"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface DepositOptionProps {
  onClose: () => void
  onDirectDepositClick: () => void
  selectedCurrency?: string
}

export default function DepositOptions({ onClose, onDirectDepositClick, selectedCurrency }: DepositOptionProps) {
  const router = useRouter()

  const handleDirectDepositClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onDirectDepositClick()
  }

  const handleP2PTradingClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    if (selectedCurrency) {
      router.push(`/?operation=buy&currency=${selectedCurrency}`)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="space-y-0 mt-6">
      <div
        className="flex justify-center items-center gap-4 self-stretch cursor-pointer pl-0 md:pl-6 py-4"
        onClick={handleP2PTradingClick}
      >
        <div className="flex-shrink-0  rounded-full flex items-center justify-center mb-4">
          <Image src="/icons/up-down-arrows.png" alt="Trade" width={24} height={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-normal text-slate-1200 leading-6">Marketplace</h3>
          <p className="text-grayscale-text-muted text-xs font-normal leading-[22px] mr-6 md:mr-0">
            {`Trade directly with other users on the marketplace.`}
          </p>

          <div className="border-b border-grayscale-200 mt-4 ml-0"></div>
        </div>
      </div>

      <div
        className="flex justify-center items-center gap-4 self-stretch cursor-pointer pl-0 md:pl-6 py-0 hidden"
        onClick={handleDirectDepositClick}
      >
        <div className="flex-shrink-0  rounded-full flex items-center justify-center mb-4">
          <Image src="/icons/bank-icon.png" alt="Bank" width={24} height={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-normal text-slate-1200 leading-6">Direct deposit</h3>
          <p className="text-grayscale-text-muted text-xs font-normal leading-[22px] mr-6 md:mr-0">
            Deposit funds directly from your bank account, e-wallet, or other payment methods.
          </p>

          <div className="border-b border-grayscale-200 mt-4 ml-0"></div>
        </div>
      </div>
    </div>
  )
}
