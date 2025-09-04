"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { X } from "lucide-react"
import Navigation from "@/components/navigation"
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
  const transactionId = params.id as string
  const isMobile = useIsMobile()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Parse transaction data from URL parameters
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

  const transactionFields = [
    { label: "Transaction ID", value: transaction?.transaction_id?.toString() },
    {
      label: "Transaction type",
      value: transaction?.metadata?.wallet_transaction_type
        ? formatTransactionType(transaction.metadata.wallet_transaction_type)
        : "",
    },
    { label: "Date", value: transaction?.timestamp ? formatDate(transaction.timestamp) : "" },
    { label: "Time", value: transaction?.timestamp ? formatTime(transaction.timestamp) : "" },
    {
      label: "From",
      value: transaction?.metadata?.source_wallet_type
        ? `${formatTransactionType(transaction.metadata.source_wallet_type)} Wallet\n${transaction?.metadata?.source_wallet_id || ""}`
        : "",
    },
    {
      label: "To",
      value:
        transaction?.metadata?.payout_method && transaction?.metadata?.destination_client_id
          ? `${transaction.metadata.payout_method}\n${transaction.metadata.destination_client_id}`
          : "",
    },
    {
      label: "Withdrawn amount",
      value:
        transaction?.metadata?.transaction_net_amount && transaction?.metadata?.transaction_currency
          ? formatAmount(transaction.metadata.transaction_net_amount, transaction.metadata.transaction_currency)
          : "",
    },
  ].filter((field) => field.value) // Only show fields with values

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="mt-2 text-slate-600">Loading transaction details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation isBackBtnVisible={true} redirectUrl="/wallet" title="" />

      <div className={`${isMobile ? "px-4" : "max-w-[560px] mx-auto px-4"}`}>
        {/* Header with close button */}
        <div className="flex justify-end pt-10">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="p-2">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Transaction details title */}
        <div className="pt-10 pb-6">
          <h1
            style={{
              color: "#00080A",
              fontSize: "24px",
              fontWeight: "800",
              fontStyle: "normal",
            }}
          >
            Transaction details
          </h1>
        </div>

        {/* Transaction fields */}
        <div className="space-y-0">
          {transactionFields.map((field, index) => (
            <div key={index} className="py-2">
              <div
                className="mb-1"
                style={{
                  color: "rgba(0, 0, 0, 0.48)",
                  fontSize: "16px",
                  fontWeight: "400",
                  fontStyle: "normal",
                }}
              >
                {field.label}
              </div>
              <div
                className="mb-4 whitespace-pre-line"
                style={{
                  color: "rgba(0, 0, 0, 0.96)",
                  fontSize: "16px",
                  fontWeight: "400",
                  fontStyle: "normal",
                }}
              >
                {field.value}
              </div>
              {index < transactionFields.length - 1 && <div className="border-b border-gray-200"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
