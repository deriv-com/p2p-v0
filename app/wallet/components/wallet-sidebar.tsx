"use client"
import Image from "next/image"
import DepositOptions from "./deposit-options"
import WithdrawOptions from "./withdraw-options"
import Transfer from "./transfer"
import { Button } from "@/components/ui/button"

interface Currency {
  code: string
  name: string
  logo: string
}

interface WalletSidebarProps {
  isOpen: boolean
  onClose: () => void
  onDirectDepositClick: (currency: string) => void
  operation?: "DEPOSIT" | "WITHDRAW" | "TRANSFER"
  onP2PTransferClick?: () => void
  onAccountTransferClick?: () => void
  currencies: Currency[]
}

export default function WalletSidebar({
  isOpen,
  onClose,
  onDirectDepositClick,
  operation = "DEPOSIT",
  onP2PTransferClick = () => {},
  onAccountTransferClick = () => {},
  currencies,
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:justify-end md:items-stretch" onClick={onClose}>
      <div
        className="bg-background w-full md:h-full md:max-w-md flex flex-col shadow-lg rounded-t-2xl md:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {operation === "TRANSFER" ? (
          <Transfer onSendClick={onP2PTransferClick} onReceiveClick={onAccountTransferClick} currencies={currencies} />
        ) : (
          <>
            <div className="flex justify-between items-center px-4 pb-3 md:py-3 mt-9 md:mt-0 md:border-b">
              <h2 className="text-lg font-bold">{getTitle()}</h2>
              <Button onClick={onClose} variant="ghost" size="sm" className="px-1">
                <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
              </Button>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
              {operation === "DEPOSIT" ? (
                <DepositOptions onClose={onClose} onDirectDepositClick={onDirectDepositClick} currencies={currencies} />
              ) : operation === "WITHDRAW" ? (
                <WithdrawOptions
                  onClose={onClose}
                  onDirectWithdrawClick={onDirectDepositClick}
                  currencies={currencies}
                />
              ) : (
                <DepositOptions onClose={onClose} onDirectDepositClick={onDirectDepositClick} currencies={currencies} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
