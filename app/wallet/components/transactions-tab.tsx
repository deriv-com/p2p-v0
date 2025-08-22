"use client"

import { useEffect, useState } from "react"
import { fetchTransactions } from "@/services/api/api-wallets"
import { ProcessingBadge, SuccessfulBadge, FailedBadge } from "@/app/wallet/components"
import { Button } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"

interface Transaction {
  transaction_id: number
  timestamp: string
  metadata: {
    transaction_status: string
    transaction_currency?: string
    transaction_net_amount?: string
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

  const filters = ["All", "Deposit", "Withdraw", "Transfer"]

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const data: TransactionsResponse = await fetchTransactions()
        console.log("Transactions API response:", data)
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
        return <ProcessingBadge />
      case "completed":
        return <SuccessfulBadge />
      default:
        return <FailedBadge />
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

  const groupedTransactions = transactions.reduce((groups: { [key: string]: Transaction[] }, transaction) => {
    const dateKey = formatDate(transaction.timestamp)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(transaction)
    return groups
  }, {})

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
    <div className="p-4 space-y-6">
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={`h-8 rounded-full px-4 text-sm font-normal ${
              activeFilter === filter ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
            style={{
              color: activeFilter === filter ? "white" : "#181C25B8",
            }}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
          <div key={dateKey} className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">{dateKey}</h3>

            <div className="space-y-3">
              {dateTransactions.map((transaction, index) => (
                <div key={transaction.transaction_id}>
                  <div className="flex items-center justify-between p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-lg">+</span>
                      </div>

                      <div>
                        <div className="font-medium text-gray-900">Deposit</div>
                        <div className="text-green-600 font-semibold">+100.00 USD</div>
                      </div>
                    </div>

                    <div>{getStatusBadge(transaction.metadata.transaction_status)}</div>
                  </div>

                  {index < dateTransactions.length - 1 && <Divider className="my-2" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">No transactions found</div>
      )}
    </div>
  )
}
