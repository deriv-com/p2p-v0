"use client"

import { useEffect, useState } from "react"
import { fetchTransactions } from "@/services/api/api-wallets"
import { Button } from "@/components/ui/button"
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

interface TransactionsTabProps {
  selectedCurrency?: string | null
}

export default function TransactionsTab({ selectedCurrency }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("All")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const filters = ["All", "Deposit", "Withdraw", "Transfer"]

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const data: TransactionsResponse = await fetchTransactions(selectedCurrency || undefined)
        setTransactions(data.data.transactions || [])
      } catch (error) {
        console.error("Error loading transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [selectedCurrency])

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

    const getAmountColor = () => {
      if (type === "Withdraw") {
        return "text-error"
      } else if (type === "Deposit") {
        return "text-success-text"
      } else if (type === "Transfer") {
        return "text-slate-1200"
      }
      return "text-slate-1200"
    }

    switch (type) {
      case "Deposit":
        return {
          iconSrc: "/icons/add-icon.png",
          amountColor: getAmountColor(),
          type: "Deposit",
        }
      case "Withdraw":
        return {
          iconSrc: "/icons/subtract-icon.png",
          amountColor: getAmountColor(),
          type: "Withdraw",
        }
      case "Transfer":
        return {
          iconSrc: "/icons/transfer-icon.png",
          amountColor: getAmountColor(),
          type: "Transfer",
        }
      default:
        return {
          iconSrc: "/icons/add-icon.png",
          amountColor: getAmountColor(),
          type: "Deposit",
        }
    }
  }

  const getTransferDestinationText = (transaction: Transaction) => {
    const { source_wallet_type, destination_wallet_type, transaction_currency } = transaction.metadata

    const isSourceP2P = source_wallet_type?.toLowerCase() === "p2p"
    const isDestinationP2P = destination_wallet_type?.toLowerCase() === "p2p"

    if (isSourceP2P && !isDestinationP2P) {

      return `P2P ${transaction_currency} -> ${transaction_currency} Wallet`
    } else if (!isSourceP2P && isDestinationP2P) {
  
      return `${transaction_currency} Wallet -> P2P ${transaction_currency}`
    } else if (isSourceP2P && isDestinationP2P) {
  
      return `P2P ${transaction_currency} -> P2P ${transaction_currency}`
    } else {

      return `${transaction_currency} Wallet`
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
      <div className="py-0 space-y-6 mx-auto overflow-hidden">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "black" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`h-8 rounded-full px-4 text-sm font-normal ${
                activeFilter === filter ? "" : "bg-white border-gray-200 hover:bg-gray-50 text-slate-600"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="space-y-6 h-[calc(100vh-16rem)] md:h-[calc(100vh-14rem)] overflow-y-scroll pb-16">
          {Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
            <div key={dateKey} className="space-y-0">
              <h3 className="text-xs font-medium text-grayscale-text-muted">{dateKey}</h3>

              <div className="space-y-0">
                {dateTransactions.map((transaction, index) => {
                  const display = getTransactionDisplay(transaction)
                  const isTransfer = display.type === "Transfer"

                  return (
                    <div key={transaction.transaction_id} className="relative">
                      <div
                        className="flex items-center justify-between min-h-[72px] py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {display.iconSrc && (
                              <Image
                                src={display.iconSrc || "/placeholder.svg"}
                                alt={`${display.type} icon`}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                                priority={index < 3}
                              />
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="text-slate-1200 text-base font-normal">{display.type}</div>
                            {isTransfer && (
                              <div className="text-xs font-normal" style={{ color: "#0000007A" }}>
                                {getTransferDestinationText(transaction)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`${display.amountColor} text-base font-normal mr-6`}>
                          {transaction.metadata.transaction_net_amount} {transaction.metadata.transaction_currency}
                        </div>
                      </div>

                      <div className="h-px bg-grayscale-200 ml-10" />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {selectedCurrency
                ? "No transactions for the selected currency"
                : activeFilter === "All"
                  ? "No transactions found"
                  : `No ${activeFilter.toLowerCase()} transactions found`}
            </div>
          )}

          {filteredTransactions.length > 0 && (
            <div className="text-center text-xs font-normal pt-0" style={{ color: "#0000003D" }}>
              End of transaction
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
