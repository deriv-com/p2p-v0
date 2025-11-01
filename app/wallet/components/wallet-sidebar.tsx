"use client"
import Image from "next/image"
import DepositOptions from "./deposit-options"
import WithdrawOptions from "./withdraw-options"
import Transfer from "./transfer"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

interface Currency {
  code: string
  name: string
  logo: string
}

interface WalletSidebarProps {
  currencySelected?: string
  isOpen: boolean
  onClose: () => void
  onDirectDepositClick: (currency: string) => void
  operation?: "DEPOSIT" | "WITHDRAW" | "TRANSFER"
  onP2PTransferClick?: () => void
  onAccountTransferClick?: () => void
  currencies: Currency[]
  transferStep: string
}

export default function WalletSidebar({
  currencySelected,
  isOpen,
  onClose,
  onDirectDepositClick,
  operation = "DEPOSIT",
  onP2PTransferClick = () => {},
  onAccountTransferClick = () => {},
  currencies,
  transferStep,
}: WalletSidebarProps) {
  const { t } = useTranslations()

  if (!isOpen) return null

  const getTitle = () => {
    switch (operation) {
      case "DEPOSIT":
        return t("wallet.deposit")
      case "WITHDRAW":
        return t("wallet.withdraw")
      case "TRANSFER":
        return t("wallet.transfer")
      default:
        return t("wallet.deposit")
    }
  }

  if (operation === "TRANSFER") {
    return (
      <div className="fixed inset-0 z-50 bg-background" onClick={onClose}>
        <div className="h-full w-full" onClick={(e) => e.stopPropagation()}>
          <Transfer
            currencySelected={currencySelected}
            onSendClick={onP2PTransferClick}
            onReceiveClick={onAccountTransferClick}
            currencies={currencies}
            onClose={onClose}
            stepVal={transferStep}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex md:justify-end md:items-stretch" onClick={onClose}>
      <div
        className="bg-background w-full h-full md:max-w-md flex flex-col shadow-lg md:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 pb-3 md:py-3 mt-9 md:mt-0 md:border-b">
          <h2 className="text-lg font-bold">{getTitle()}</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          {operation === "DEPOSIT" ? (
            <DepositOptions onClose={onClose} onDirectDepositClick={onDirectDepositClick} currencies={currencies} />
          ) : (
            <WithdrawOptions onClose={onClose} onDirectWithdrawClick={onDirectDepositClick} currencies={currencies} />
          )}
        </div>
      </div>
    </div>
  )
}
