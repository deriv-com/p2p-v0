"use client"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
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

export default function TransactionDetails({ transaction, onClose }: TransactionDetailsProps) {
  const isMobile = useIsMobile()

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

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = Number.parseFloat(amount)
    return `${numAmount.toFixed(2)} ${currency}`
  }

  const getTransactionType = (transaction: Transaction) => {
    const walletTransactionType = transaction.metadata.wallet_transaction_type
    if (walletTransactionType === "transfer_cashier_to_wallet") {
      return "Deposit"
    } else if (walletTransactionType === "transfer_cashier_from_wallet") {
      return "Withdraw"
    } else if (walletTransactionType === "transfer_between_wallets") {
      return "Transfer"
    }
    return formatTransactionType(walletTransactionType)
  }

  const getFromWalletName = (transaction: Transaction) => {
    const sourceWalletType = transaction.metadata.source_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (sourceWalletType === "main") {
      return `${transactionCurrency} Wallet`
    } else if (sourceWalletType === "system") {
      return transaction.metadata.payout_method || "External"
    } else if (sourceWalletType === "p2p") {
      return `P2P ${transactionCurrency}`
    }
    return formatTransactionType(sourceWalletType)
  }

  const getToWalletName = (transaction: Transaction) => {
    const destinationWalletType = transaction.metadata.destination_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (destinationWalletType === "main") {
      return `${transactionCurrency} Wallet`
    } else if (destinationWalletType === "system") {
      return transaction.metadata.payout_method || "External"
    } else if (destinationWalletType === "p2p") {
      return `P2P ${transactionCurrency}`
    }
    return formatTransactionType(destinationWalletType)
  }

  const getTransactionDisplay = (transaction: Transaction) => {
    const type = getTransactionType(transaction)
    const amount = formatAmount(transaction.metadata.transaction_net_amount, transaction.metadata.transaction_currency)

    switch (type) {
      case "Deposit":
        return {
          icon: "/icons/add-green.png",
          iconBg: "bg-[#00883214]",
          amount: amount,
          amountColor: "text-success-text",
          subtitle: "Deposit",
          subtitleColor: "text-grayscale-text-muted",
        }
      case "Withdraw":
        return {
          icon: "/icons/withdraw-red.png",
          iconBg: "bg-[#E6190E14]",
          amount: amount,
          amountColor: "text-error-text",
          subtitle: "Withdraw",
          subtitleColor: "text-grayscale-text-muted",
        }
      case "Transfer":
        return {
          icon: "/icons/transfer-bold.png",
          iconBg: "bg-[#181C2514]",
          amount: amount,
          amountColor: "text-slate-1200",
          subtitle: `${getFromWalletName(transaction)} → ${getToWalletName(transaction)}`,
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
        return { text: "Success", color: "text-success-text" }
      case "pending":
        return { text: "Processing", color: "text-pending-text-secondary" }
      case "processing":
        return { text: "Processing", color: "text-pending-text-secondary" }
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
    <div className="fixed w-full h-full bg-white top-0 left-0 overflow-y-auto z-50">
      <div
        className={`bg-slate-75 pt-16 pb-6 flex flex-col items-center relative ${isMobile ? "" : "mt-6 mx-auto w-[592px] rounded-2xl"}`}
      >
        <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-4 right-6 px-0 z-10">
          <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
        </Button>

        <div className={`${isMobile ? "w-full" : "max-w-[592px]"} flex flex-col items-center`}>
          <div className={`w-16 h-16 rounded-full ${display.iconBg} flex items-center justify-center mb-4`}>
            <Image src={display.icon || "/placeholder.svg"} alt={transactionType} width={28} height={28} />
          </div>
          <div className={`text-[24px] font-extrabold ${display.amountColor}`}>{display.amount}</div>
          <div className={`text-sm font-normal ${display.subtitleColor}`}>{display.subtitle}</div>
        </div>
      </div>

      <div className={`${isMobile ? "" : "max-w-[592px] mx-auto"} pb-20 pt-6`}>
        <div className="px-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">Transaction status</span>
            <span className={`text-base font-normal ${statusDisplay.color}`}>{statusDisplay.text}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">Transaction ID</span>
            <span className="text-base font-normal text-slate-1200">{transaction.transaction_id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">Transaction type</span>
            <span className="text-base font-normal text-slate-1200">{transactionType}</span>
          </div>
        </div>

        <div className="my-6">
          <div className="h-1 bg-slate-75" />
        </div>

        <div className="px-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">From</span>
            <span className="text-base font-normal text-slate-1200">{getFromWalletName(transaction)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">To</span>
            <span className="text-base font-normal text-slate-1200">{getToWalletName(transaction)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">Amount</span>
            <span className="text-base font-normal text-slate-1200">{display.amount}</span>
          </div>
        </div>

        <div className="my-6">
          <div className="h-1 bg-slate-75" />
        </div>

        <div className="px-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">Date</span>
            <span className="text-base font-normal text-slate-1200">{formatDate(transaction.timestamp)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-base font-normal text-grayscale-text-muted">Time</span>
            <span className="text-base font-normal text-slate-1200">{formatTime(transaction.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
