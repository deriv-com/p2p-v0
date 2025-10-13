"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import DepositOptions from "./deposit-options"
import WithdrawOptions from "./withdraw-options"

interface WalletActionStepProps {
  title: string
  actionType: "deposit" | "withdraw"
  onClose: () => void
  onGoBack: () => void
  onDirectDepositClick?: () => void
  onDirectWithdrawClick?: () => void
  selectedCurrency?: string
}

export default function WalletActionStep({
  title,
  actionType,
  onClose,
  onGoBack,
  onDirectDepositClick,
  onDirectWithdrawClick,
  selectedCurrency,
}: WalletActionStepProps) {
  return (
    <div className="absolute inset-0 flex flex-col h-full pt-4 md:pt-[20px] pr-0 pl-4 pb-0">
      <div className="flex justify-between items-center mb-10 md:max-w-[608px] md:mx-auto md:w-full">
        <Button variant="ghost" size="sm" className="px-0 md:hidden" onClick={onGoBack} aria-label="Go back">
          <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
        </Button>
        <div className="hidden md:block w-8 h-8"></div>
        <Button variant="ghost" size="sm" className="px-0 pr-4 md:pr-0" onClick={onClose} aria-label="Close">
          <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
        </Button>
      </div>
      <div className="md:max-w-[608px] md:mx-auto md:w-full flex-1 flex flex-col min-h-0">
        <div className="px-2 flex-shrink-0">
          <h1 className="text-slate-1200 text-xl md:text-[32px] font-extrabold mb-0">{title}</h1>
        </div>
        <div className="pl-2 pr-0 md:pr-4 flex-1 min-h-0">
          <div className="h-full overflow-y-auto">
            {actionType === "deposit" && onDirectDepositClick && (
              <DepositOptions
                onClose={onClose}
                onDirectDepositClick={onDirectDepositClick}
                selectedCurrency={selectedCurrency}
              />
            )}
            {actionType === "withdraw" && onDirectWithdrawClick && (
              <WithdrawOptions
                onClose={onClose}
                onDirectWithdrawClick={onDirectWithdrawClick}
                selectedCurrency={selectedCurrency}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
