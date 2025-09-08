"use client"

import { useEffect, useState } from "react"
import { fetchTransactions } from "@/services/api/api-wallets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import Image from "next/image"
import TransactionDetails from "./transaction-details"

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

interface TransactionsResponse {
  data: {
    transactions: Transaction[]
  }
}

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("All")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const filters = ["All", "Deposit", "Withdraw", "Transfer"]

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const data: TransactionsResponse = await fetchTransactions()
        setTransactions(data.data.transactions || [])
      } catch (error) {
        console.error("Error loading transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="pending-secondary" className="h-6 rounded">
            Processing
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="success-secondary" className="h-6 rounded">
            Successful
          </Badge>
        )
      default:
        return (
          <Badge variant="error-secondary" className="h-6 rounded">
            Failed
          </Badge>
        )
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    }

    return date.toLocaleDateString()
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
  }

  const getTransactionDisplay = (transaction: Transaction) => {
    const type = getTransactionType(transaction)
    const status = transaction.metadata.transaction_status

    const getAmountColor = () => {
      if (type === "Transfer") {
        return "text-black opacity-96"
      } else if (type === "Deposit") {
        return status === "completed" ? "text-success-text-secondary" : "text-black opacity-48"
      } else if (type === "Withdraw") {
        return status === "completed" ? "text-red-withdraw" : "text-black opacity-48"
      }
      return "text-success-icon"
    }

    switch (type) {
      case "Deposit":
        return {
          iconSrc: "/icons/add-icon.png",
          amountColor: getAmountColor(),
          amountPrefix: "+",
          type: "Deposit",
        }
      case "Withdraw":
        return {
          iconSrc: "/icons/subtract-icon.png",
          amountColor: getAmountColor(),
          amountPrefix: "-",
          type: "Withdraw",
        }
      case "Transfer":
        return {
          iconSrc: "/icons/transfer-icon.png",
          amountColor: getAmountColor(),
          amountPrefix: "",
          type: "Transfer",
        }
      default:
        return {
          iconSrc: "/icons/add-icon.png",
          amountColor: getAmountColor(),
          amountPrefix: "+",
          type: "Deposit",
        }
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeFilter === "All") {
      return true
    }
    return getTransactionType(transaction) === activeFilter
  })

  const groupedTransactions = filteredTransactions.reduce((groups: { [key: string]: Transaction[] }, transaction) => {
    const dateKey = formatDate(transaction.timestamp)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(transaction)
    return groups
  }, {})

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const handleCloseTransactionDetails = () => {
    setSelectedTransaction(null)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="py-4 space-y-6 max-w-[560px] mx-auto overflow-hidden">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "black" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`h-8 rounded-full px-4 text-sm font-normal ${
                activeFilter === filter
                  ? "" // No override needed, black variant handles this
                  : "bg-white border-gray-200 hover:bg-gray-50 text-slate-600"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="space-y-6 h-[calc(100vh-16rem)] md:h-[calc(100vh-14rem)] overflow-y-scroll">
          {Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
            <div key={dateKey} className="space-y-4">
              <h3 className="text-xs font-medium text-gray-500">{dateKey}</h3>

              <div className="space-y-3">
                {dateTransactions.map((transaction, index) => {
                  const display = getTransactionDisplay(transaction)

                  return (
                    <div key={transaction.transaction_id}>
                      <div
                        className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {display.iconSrc && (
                              <Image
                                src={display.iconSrc || "/placeholder.svg"}
                                alt={`${display.type} icon`}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                                priority={index < 3}
                              />
                            )}
                          </div>

                          <div>
                            <div className="text-base font-normal text-gray-900">{display.type}</div>
                            <div className={`${display.amountColor} text-base font-bold`}>
                              {display.amountPrefix}
                              {transaction.metadata.transaction_net_amount} {transaction.metadata.transaction_currency}
                            </div>
                          </div>
                        </div>

                        <div>{getStatusBadge(transaction.metadata.transaction_status)}</div>
                      </div>

                      {index < dateTransactions.length - 1 && <Divider className="my-2" />}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredTransactions.length > 0 && <div className="p-4 h-16"></div>}

          {filteredTransactions.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {activeFilter === "All" ? "No transactions found" : `No ${activeFilter.toLowerCase()} transactions found`}
            </div>
          )}
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetails transaction={selectedTransaction} onClose={handleCloseTransactionDetails} />
      )}
    </>
  )
}
