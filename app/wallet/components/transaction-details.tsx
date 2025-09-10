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
      return "Trading Wallet"
    } else if (sourceWalletType === "system") {
      return `${transactionCurrency} Wallet`
    } else if (sourceWalletType === "p2p") {
      return "P2P Wallet"
    }
    return formatTransactionType(sourceWalletType)
  }

  const getToWalletName = (transaction: Transaction) => {
    const destinationWalletType = transaction.metadata.destination_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (destinationWalletType === "main") {
      return "Trading Wallet"
    } else if (destinationWalletType === "system") {
      return `${transactionCurrency} Wallet`
    } else if (destinationWalletType === "p2p") {
      return "P2P Wallet"
    }
    return formatTransactionType(destinationWalletType)
  }

  const transactionFields = [
    { label: "Transaction ID", value: transaction?.transaction_id?.toString() },
    {
      label: "Transaction type",
      value: transaction ? getTransactionType(transaction) : "",
    },
    { label: "Date", value: transaction?.timestamp ? formatDate(transaction.timestamp) : "" },
    { label: "Time", value: transaction?.timestamp ? formatTime(transaction.timestamp) : "" },
    {
      label: "From",
      value: transaction?.metadata?.source_wallet_type ? getFromWalletName(transaction) : "",
    },
    {
      label: "To",
      value: transaction?.metadata?.destination_wallet_type ? getToWalletName(transaction) : "",
    },
    {
      label: "Withdrawn amount",
      value:
        transaction?.metadata?.transaction_net_amount && transaction?.metadata?.transaction_currency
          ? formatAmount(transaction.metadata.transaction_net_amount, transaction.metadata.transaction_currency)
          : "",
    },
  ].filter((field) => field.value)

  const getStepperState = (status: string) => {
    switch (status) {
      case "pending":
        return {
          step1: { border: "border-black", bg: "bg-white", text: "text-black" },
          step2: { border: "border-[#0000003D]", bg: "bg-white", text: "text-[#0000003D]" },
          connector: "bg-[#0000003D]",
          showTick: false,
        }
      case "released":
        return {
          step1: { border: "border-black", bg: "bg-white", text: "text-black" },
          step2: { border: "border-[#0000003D]", bg: "bg-white", text: "text-[#0000003D]" },
          connector: "bg-[#0000003D]",
          showTick: false,
        }
      case "completed":
        return {
          step1: { border: "border-[#00C390]", bg: "bg-[#00C390]", text: "text-black" },
          step2: { border: "border-[#00C390]", bg: "bg-[#00C390]", text: "text-black" },
          connector: "bg-[#00C390]",
          showTick: true,
        }
      case "reverted":
        return {
          step1: { border: "border-[#0000003D]", bg: "bg-white", text: "text-[#0000003D]" },
          step2: { border: "border-[#0000003D]", bg: "bg-white", text: "text-[#0000003D]" },
          connector: "bg-[#0000003D]",
          showTick: false,
        }
      default:
        return {
          step1: { border: "border-[#0000003D]", bg: "bg-white", text: "text-[#0000003D]" },
          step2: { border: "border-[#0000003D]", bg: "bg-white", text: "text-[#0000003D]" },
          connector: "bg-[#0000003D]",
          showTick: false,
        }
    }
  }

  if (!transaction) {
    return null
  }

  const stepperState = getStepperState(transaction.metadata.transaction_status)

  return (
    <div className="fixed w-full h-full bg-white top-0 left-0 md:px-[24px] overflow-y-auto z-50">
      <div className={`${isMobile ? "px-4" : "max-w-[560px] mx-auto px-4"}`}>
        <div className="flex justify-end pt-4 md:pt-10">
          <Button variant="ghost" size="sm" onClick={onClose} className="px-0">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="pt-10 pb-6">
          <h1 className="text-slate-900 text-2xl font-extrabold ml-2">Transaction details</h1>
        </div>

        <div className="px-2 pb-6">
          <div className="flex flex-col">
            {/* Step 1 */}
            <div className="flex items-center mb-2">
              <div
                className={`w-5 h-5 rounded-full border-2 ${stepperState.step1.border} ${stepperState.step1.bg} relative flex items-center justify-center`}
              >
                {stepperState.showTick && <Image src="/icons/tick_white.png" alt="Completed" width={11} height={11} />}
              </div>
              <span className={`ml-2 text-sm font-bold ${stepperState.step1.text}`}>Processed</span>
            </div>

            {/* Connector */}
            <div className={`w-0.5 h-2 ml-2 mb-2 ${stepperState.connector}`}></div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 ${stepperState.step2.border} ${stepperState.step2.bg} relative flex items-center justify-center`}
              >
                {stepperState.showTick && <Image src="/icons/tick_white.png" alt="Completed" width={11} height={11} />}
              </div>
              <span className={`ml-2 text-sm font-bold ${stepperState.step2.text}`}>Successful</span>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          {transactionFields.map((field, index) => (
            <div key={index} className="py-2 px-2">
              <div className="mb-1 text-black/48 text-base font-normal">{field.label}</div>
              <div className="mb-4 whitespace-pre-line text-black/96 text-base font-normal">{field.value}</div>
              {index < transactionFields.length - 1 && <div className="border-b border-gray-200"></div>}
            </div>
          ))}
        </div>

        {isMobile && <div className="h-[150px]" />}
      </div>
    </div>
  )
}
