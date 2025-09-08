"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

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

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.id as string
  const isMobile = useIsMobile()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const UUID = /[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}/

  function extractFirstUUID(str: string) {
    const m = str.match(UUID)
    return m ? m[0] : null
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const transactionData = urlParams.get("data")

    if (transactionData) {
      try {
        const parsedTransaction = JSON.parse(decodeURIComponent(transactionData))
        setTransaction(parsedTransaction)
      } catch (error) {
        console.error("Error parsing transaction data:", error)
      }
    }
    setIsLoading(false)
  }, [transactionId])

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
      value: transaction?.metadata?.source_wallet_type
        ? `${getFromWalletName(transaction)}\n${extractFirstUUID(transaction.metadata.source_wallet_id)}`
        : "",
    },
    {
      label: "To",
      value: transaction?.metadata?.destination_wallet_type
        ? `${getToWalletName(transaction)}\n${extractFirstUUID(transaction.metadata.destination_wallet_id)}`
        : "",
    },
    {
      label: "Withdrawn amount",
      value:
        transaction?.metadata?.transaction_net_amount && transaction?.metadata?.transaction_currency
          ? formatAmount(transaction.metadata.transaction_net_amount, transaction.metadata.transaction_currency)
          : "",
    },
  ].filter((field) => field.value)

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="mt-2 text-slate-600">Loading transaction details...</p>
      </div>
    )
  }

  return (
    <div className="fixed w-full h-full bg-white top-0 left-0 md:px-[24px] overflow-y-auto">
      <div className={`${isMobile ? "px-4" : "max-w-[560px] mx-auto px-4"}`}>
        <div className="flex justify-end pt-4 md:pt-10">
          <Button variant="ghost" size="sm" onClick={() => router.push("/wallet")} className="">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} />
          </Button>
        </div>

        <div className="pt-10 pb-6">
          <h1 className="text-slate-900 text-2xl font-extrabold">Transaction details</h1>
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
