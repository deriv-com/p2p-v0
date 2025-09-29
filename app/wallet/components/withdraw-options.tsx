"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface WithdrawOptionProps {
  onClose: () => void
  onDirectWithdrawClick: (currency: string) => void
  currencies: Currency[]
  selectedCurrency: string
}

interface Currency {
  code: string
  name: string
  logo: string
}

export default function WithdrawOptions({
  onClose,
  onDirectWithdrawClick,
  currencies,
  selectedCurrency,
}: WithdrawOptionProps) {
  const router = useRouter()
  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency) || currencies[0]

  const handleDirectWithdrawClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onDirectWithdrawClick(selectedCurrency)
  }

  const handleP2PTradingClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    router.push("/")
  }

  return (
    <div className="space-y-0 mt-6">
      <div
        className="flex justify-center items-center gap-4 self-stretch cursor-pointer pl-6 py-4"
        onClick={handleP2PTradingClick}
      >
        <div className="flex-shrink-0  rounded-full flex items-center justify-center mb-4">
          <Image src="/icons/up-down-arrows.png" alt="Trade" width={24} height={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-normal text-slate-1200 leading-6">Marketplace</h3>
          <p className="text-grayscale-text-muted text-xs font-normal leading-[22px]">
            {`Sell ${selectedCurrencyData?.name} directly to other users on the P2P marketplace.`}
          </p>
          <div className="border-b border-grayscale-200 mt-4 ml-0"></div>
        </div>
      </div>

      <div
        className="flex justify-center items-center gap-4 self-stretch cursor-pointer pl-6 py-4"
        onClick={handleDirectWithdrawClick}
      >
        <div className="flex-shrink-0  rounded-full flex items-center justify-center mb-4">
          <Image src="/icons/bank-icon.png" alt="Bank" width={24} height={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-normal text-slate-1200 leading-6">Direct withdrawal</h3>
          <p className="text-grayscale-text-muted text-xs font-normal leading-[22px]">
            Withdraw funds directly to your bank account, e-wallet, or other payment methods.
          </p>
          <div className="border-b border-grayscale-200 mt-4 ml-0"></div>
        </div>
      </div>
    </div>
  )
}
