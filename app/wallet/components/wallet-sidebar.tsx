"use client"
import Image from "next/image"
import DepositOptions from "./deposit-options"
import WithdrawOptions from "./withdraw-options"
import { Button } from "@/components/ui/button"

interface WalletSidebarProps {
  isOpen: boolean
  onClose: () => void
  onDirectDepositClick: (currency: string) => void // Added currency parameter
  operation?: "DEPOSIT" | "WITHDRAW"
}

export default function WalletSidebar({
  isOpen,
  onClose,
  onDirectDepositClick,
  operation = "DEPOSIT",
}: WalletSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div className="bg-background h-full w-[400px] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-xl font-bold">{operation === "DEPOSIT" ? "Deposit" : "Withdraw"}</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {operation === "DEPOSIT" ? (
            <DepositOptions onClose={onClose} onDirectDepositClick={onDirectDepositClick} />
          ) : (
            <WithdrawOptions onClose={onClose} onDirectWithdrawClick={onDirectDepositClick} />
          )}
        </div>
      </div>
    </div>
  )
}
