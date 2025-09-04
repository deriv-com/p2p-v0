"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import { X, ExternalLink } from "lucide-react"

interface TransactionMetadata {
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

interface Transaction {
  transaction_id: number
  timestamp: string
  metadata: TransactionMetadata
}

export default function TransactionDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get transaction data from URL params (passed as JSON string)
  const transactionData = searchParams.get("data")
  const transaction: Transaction | null = transactionData ? JSON.parse(decodeURIComponent(transactionData)) : null

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Transaction not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      timeZoneName: "short",
    })
  }

  const getTransactionType = () => {
    const walletTransactionType = transaction.metadata.wallet_transaction_type
    if (walletTransactionType === "transfer_cashier_to_wallet") {
      return "Deposit"
    } else if (walletTransactionType === "transfer_cashier_from_wallet") {
      return "Withdraw"
    } else if (walletTransactionType === "transfer_between_wallets") {
      return "Transfer"
    }
    return "Unknown"
  }

  const detailFields = [
    { label: "Transaction ID", value: transaction.transaction_id.toString() },
    { label: "Transaction type", value: getTransactionType() },
    { label: "Date", value: formatDate(transaction.timestamp) },
    { label: "Time", value: formatTime(transaction.timestamp) },
    { label: "From", value: `${transaction.metadata.source_wallet_type}\n${transaction.metadata.source_wallet_id}` },
    {
      label: "To",
      value: `${transaction.metadata.destination_wallet_type}\n${transaction.metadata.destination_wallet_id}`,
    },
    {
      label: "Transferred amount",
      value: `${transaction.metadata.transaction_gross_amount} ${transaction.metadata.transaction_currency}`,
    },
    {
      label: "Amount received",
      value: `${transaction.metadata.transaction_net_amount} ${transaction.metadata.transaction_currency}`,
    },
    { label: "Status", value: transaction.metadata.transaction_status },
    { label: "Brand name", value: transaction.metadata.brand_name },
    { label: "Description", value: transaction.metadata.description },
    { label: "Payout method", value: transaction.metadata.payout_method },
    { label: "Requester platform", value: transaction.metadata.requester_platform },
    { label: "Is reversible", value: transaction.metadata.is_reversible },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header with close button */}
      <div className="pt-10 px-4">
        <div className="max-w-[560px] mx-auto">
          <div className="flex justify-end mb-10">
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => window.open("#", "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => router.back()}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Transaction details title */}
          <h1
            className="mb-6"
            style={{
              color: "#00080A",
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: 800,
            }}
          >
            Transaction details
          </h1>

          {/* Transaction details list */}
          <div className="w-full md:max-w-[560px]">
            {detailFields.map((field, index) => (
              <div key={field.label}>
                <div className="py-2">
                  <div
                    className="mb-1"
                    style={{
                      color: "rgba(0, 0, 0, 0.48)",
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 400,
                    }}
                  >
                    {field.label}
                  </div>
                  <div
                    style={{
                      color: "rgba(0, 0, 0, 0.96)",
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 400,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {field.value}
                  </div>
                </div>
                {index < detailFields.length - 1 && <Divider className="my-2 border-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
