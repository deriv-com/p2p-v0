"use client"
import Image from "next/image"
import DepositOptions from "./deposit-options"
import WithdrawOptions from "./withdraw-options"
import TransferOptions from "./transfer-options"
import { Button } from "@/components/ui/button"

interface WalletSidebarProps {
  isOpen: boolean
  onClose: () => void
  onDirectDepositClick: (currency: string) => void
  operation?: "DEPOSIT" | "WITHDRAW" | "TRANSFER"
  onP2PTransferClick?: () => void
  onAccountTransferClick?: () => void
}

export default function WalletSidebar({
  isOpen,
  onClose,
  onDirectDepositClick,
  operation = "DEPOSIT",
  onP2PTransferClick = () => {},
  onAccountTransferClick = () => {},
}: WalletSidebarProps) {
  if (!isOpen) return null

  const getTitle = () => {
    switch (operation) {
      case "DEPOSIT":
        return "Deposit"
      case "WITHDRAW":
        return "Withdraw"
      case "TRANSFER":
        return "Transfer"
      default:
        return "Deposit"
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div
        className="bg-background h-full w-full max-w-md flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-xl font-bold">{getTitle()}</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {operation === "DEPOSIT" ? (
            <DepositOptions onClose={onClose} onDirectDepositClick={onDirectDepositClick} />
          ) : operation === "WITHDRAW" ? (
            <WithdrawOptions onClose={onClose} onDirectWithdrawClick={onDirectDepositClick} />
          ) : operation === "TRANSFER" ? (
            <TransferOptions
              onClose={onClose}
              onP2PTransferClick={onP2PTransferClick}
              onAccountTransferClick={onAccountTransferClick}
            />
          ) : (
            <DepositOptions onClose={onClose} onDirectDepositClick={onDirectDepositClick} />
          )}
        </div>
      </div>
    </div>
  )
}
