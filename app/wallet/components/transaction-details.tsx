"use client"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"
import Image from "next/image"

interface Transaction {
  transaction_id: number
  timestamp: string
  metadata: {
    brand_name: string
    description: string
    destination_client_id: string
    destination_wallet_id: string
    destination_wallet_type: string
    is_reversible: string
    payout_method: string
    requester_platform: string
    source_client_id: string
    source_wallet_id: string
    source_wallet_type: string
    transaction_currency: string
    transaction_gross_amount: string
    transaction_net_amount: string
    transaction_status: string
    wallet_transaction_type: string
  }
}

interface TransactionDetailsProps {
  transaction: Transaction | null
  onClose: () => void
}

interface DisplayInfo {
  icon: string
  iconBg: string
  amount: string
  amountColor: string
  subtitle: string
  subtitleColor: string
}

interface StatusDisplay {
  text: string
  color: string
}

function TransactionDetailsContent({
  transaction,
  display,
  statusDisplay,
  transactionType,
  onClose,
}: {
  transaction: Transaction
  display: DisplayInfo
  statusDisplay: StatusDisplay
  transactionType: string
  onClose: () => void
}) {
  const { t } = useTranslations()

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return (
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " GMT"
    )
  }

  const formatTransactionType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getFromWalletName = (transaction: Transaction) => {
    const sourceWalletType = transaction.metadata.source_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (sourceWalletType === "main") {
      return t("wallet.walletName", { currency: transactionCurrency })
    } else if (sourceWalletType === "system") {
      return transaction.metadata.payout_method || t("wallet.external")
    } else if (sourceWalletType === "p2p") {
      return `P2P ${transactionCurrency}`
    }
    return formatTransactionType(sourceWalletType)
  }

  const getToWalletName = (transaction: Transaction) => {
    const destinationWalletType = transaction.metadata.destination_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (destinationWalletType === "main") {
      return t("wallet.walletName", { currency: transactionCurrency })
    } else if (destinationWalletType === "system") {
      return transaction.metadata.payout_method || t("wallet.external")
    } else if (destinationWalletType === "p2p") {
      return `P2P ${transactionCurrency}`
    }
    return formatTransactionType(destinationWalletType)
  }

  return (
    <>
      <div className="bg-slate-75 pt-16 pb-6 flex flex-col items-center relative">
        <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-4 right-6 px-0 z-10">
          <Image src="/icons/close-circle-secondary.png" alt={t("common.close")} width={32} height={32} />
        </Button>

        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full ${display.iconBg} flex items-center justify-center mb-4`}>
            <Image src={display.icon || "/placeholder.svg"} alt={transactionType} width={28} height={28} />
          </div>
          <div className={`text-[24px] font-extrabold ${display.amountColor}`}>{display.amount}</div>
          <div className={`text-sm font-normal ${display.subtitleColor}`}>{display.subtitle}</div>
        </div>
      </div>

      <div className="pb-20 pt-6">
        <div className="px-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.transactionStatus")}</span>
            <span className={`text-base font-normal ${statusDisplay.color}`}>{statusDisplay.text}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.transactionId")}</span>
            <span className="text-base font-normal text-slate-1200">{transaction.transaction_id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.transactionType")}</span>
            <span className="text-base font-normal text-slate-1200">{transactionType}</span>
          </div>
        </div>

        <div className="my-6">
          <div className="h-1 bg-slate-75" />
        </div>

        <div className="px-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.from")}</span>
            <span className="text-base font-normal text-slate-1200">{getFromWalletName(transaction)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.to")}</span>
            <span className="text-base font-normal text-slate-1200">{getToWalletName(transaction)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.amount")}</span>
            <span className="text-base font-normal text-slate-1200">{display.amount}</span>
          </div>
        </div>

        <div className="my-6">
          <div className="h-1 bg-slate-75" />
        </div>

        <div className="px-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.date")}</span>
            <span className="text-base font-normal text-slate-1200">{formatDate(transaction.timestamp)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">{t("wallet.time")}</span>
            <span className="text-base font-normal text-slate-1200">{formatTime(transaction.timestamp)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function TransactionDetails({ transaction, onClose }: TransactionDetailsProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = Number.parseFloat(amount)
    return `${numAmount.toFixed(2)} ${currency}`
  }

  const formatTransactionType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getTransactionType = (transaction: Transaction) => {
    const walletTransactionType = transaction.metadata.wallet_transaction_type
    if (walletTransactionType === "transfer_cashier_to_wallet") {
      return t("wallet.deposit")
    } else if (walletTransactionType === "transfer_cashier_from_wallet") {
      return t("wallet.withdraw")
    } else if (walletTransactionType === "transfer_between_wallets") {
      return t("wallet.transfer")
    }
    return formatTransactionType(walletTransactionType)
  }

  const getFromWalletName = (transaction: Transaction) => {
    const sourceWalletType = transaction.metadata.source_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (sourceWalletType === "main") {
      return t("wallet.walletName", { currency: transactionCurrency })
    } else if (sourceWalletType === "system") {
      return transaction.metadata.payout_method || t("wallet.external")
    } else if (sourceWalletType === "p2p") {
      return `P2P ${transactionCurrency}`
    }
    return formatTransactionType(sourceWalletType)
  }

  const getTransactionDisplay = (transaction: Transaction) => {
    const type = getTransactionType(transaction)
    const amount = formatAmount(transaction.metadata.transaction_net_amount, transaction.metadata.transaction_currency)

    switch (type) {
      case t("wallet.deposit"):
        return {
          icon: "/icons/add-green.png",
          iconBg: "bg-success-light",
          amount: amount,
          amountColor: "text-success-text",
          subtitle: t("wallet.deposit"),
          subtitleColor: "text-grayscale-text-muted",
        }
      case t("wallet.withdraw"):
        return {
          icon: "/icons/withdraw-red.png",
          iconBg: "bg-error-light",
          amount: amount,
          amountColor: "text-error-text",
          subtitle: t("wallet.withdraw"),
          subtitleColor: "text-grayscale-text-muted",
        }
      case t("wallet.transfer"):
        return {
          icon: "/icons/transfer-bold.png",
          iconBg: "bg-slate-1200/[0.08]",
          amount: amount,
          amountColor: "text-slate-1200",
          subtitle: `${getFromWalletName(transaction)} → ${getFromWalletName(transaction)}`,
          subtitleColor: "text-grayscale-text-muted",
        }
      default:
        return {
          icon: "/icons/add-green.png",
          iconBg: "bg-slate-100",
          amount: amount,
          amountColor: "text-slate-1200",
          subtitle: type,
          subtitleColor: "text-grayscale-text-muted",
        }
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "complete":
      case "completed":
        return { text: t("wallet.success"), color: "text-success-text" }
      case "pending":
      case "processing":
        return { text: t("wallet.processing"), color: "text-pending-text-secondary" }
      default:
        return { text: status, color: "text-slate-1200" }
    }
  }

  if (!transaction) {
    return null
  }

  const display = getTransactionDisplay(transaction)
  const statusDisplay = getStatusDisplay(transaction.metadata.transaction_status)
  const transactionType = getTransactionType(transaction)

  return (
    <>
      {/* Mobile fullscreen modal */}
      {isMobile && (
        <div className="fixed w-full h-full bg-white top-0 left-0 overflow-y-auto z-50 md:hidden">
          <TransactionDetailsContent
            transaction={transaction}
            display={display}
            statusDisplay={statusDisplay}
            transactionType={transactionType}
            onClose={onClose}
          />
        </div>
      )}

      {/* Desktop sidebar modal */}
      {!isMobile && (
        <div className="hidden md:block fixed inset-0 bg-black/50 z-50" onClick={onClose}>
          <div className="fixed right-0 top-0 h-full w-[592px] bg-white overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-[592px]">
              <TransactionDetailsContent
                transaction={transaction}
                display={display}
                statusDisplay={statusDisplay}
                transactionType={transactionType}
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
