"use client"

import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionDetailsProps {
  transaction: {
    transaction_id: number
    timestamp: string
    metadata: {
      transaction_status: string
      transaction_currency: string
      transaction_net_amount: string
      transaction_gross_amount: string
      source_wallet_id: string
      destination_wallet_id: string
      wallet_transaction_type: string
      brand_name: string
      description: string
      destination_client_id: string
      destination_wallet_type: string
      is_reversible: string
      payout_method: string
      requester_platform: string
      source_client_id: string
      source_wallet_type: string
    }
  }
  onClose: () => void
}

export default function TransactionDetails({ transaction, onClose }: TransactionDetailsProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp) * 1000)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp) * 1000)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }

  const formatAmount = (amount: string, currency: string) => {
    return `${Number.parseFloat(amount).toFixed(2)} ${currency}`
  }

  const detailItems = [
    { label: "Transaction ID", value: transaction.transaction_id.toString() },
    { label: "Transaction type", value: transaction.metadata.wallet_transaction_type },
    { label: "Date", value: formatDate(transaction.timestamp) },
    { label: "Time", value: formatTime(transaction.timestamp) },
    {
      label: "From",
      value: `${transaction.metadata.source_wallet_type} Wallet\n${transaction.metadata.source_wallet_id}`,
    },
    {
      label: "To",
      value: `${transaction.metadata.destination_wallet_type} Wallet\n${transaction.metadata.destination_wallet_id}`,
    },
    {
      label: "Transferred amount",
      value: formatAmount(transaction.metadata.transaction_gross_amount, transaction.metadata.transaction_currency),
    },
    {
      label: "Amount received",
      value: formatAmount(transaction.metadata.transaction_net_amount, transaction.metadata.transaction_currency),
    },
    { label: "Status", value: transaction.metadata.transaction_status },
    { label: "Brand", value: transaction.metadata.brand_name },
    { label: "Description", value: transaction.metadata.description },
    { label: "Payout method", value: transaction.metadata.payout_method },
    { label: "Platform", value: transaction.metadata.requester_platform },
    { label: "Reversible", value: transaction.metadata.is_reversible === "1" ? "Yes" : "No" },
    { label: "Source client ID", value: transaction.metadata.source_client_id },
    { label: "Destination client ID", value: transaction.metadata.destination_client_id },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pt-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pb-6">
          <h1
            className="text-2xl font-extrabold"
            style={{
              color: "#00080A",
              fontSize: "24px",
              fontWeight: "800",
            }}
          >
            Transaction details
          </h1>
        </div>

        {/* Details */}
        <div className="px-6 pb-6">
          {detailItems.map((item, index) => (
            <div key={index} className="py-2">
              <div
                className="text-base mb-1"
                style={{
                  color: "rgba(0, 0, 0, 0.48)",
                  fontSize: "16px",
                  fontWeight: "400",
                }}
              >
                {item.label}
              </div>
              <div
                className="text-base whitespace-pre-line"
                style={{
                  color: "rgba(0, 0, 0, 0.96)",
                  fontSize: "16px",
                  fontWeight: "400",
                }}
              >
                {item.value}
              </div>
              {index < detailItems.length - 1 && <div className="border-b border-gray-200 mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
