"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProcessingBadge, SuccessfulBadge, FailedBadge } from "./index"
import { fetchTransactions } from "@/services/api/api-wallets"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  status: "processing" | "successful" | "failed"
  created_at: string
  description?: string
}

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadTransactions = async () => {
    try {
      setIsRefreshing(true)
      const data = await fetchTransactions()

      // Transform API response to match our interface
      if (data && data.data) {
        const transformedTransactions = data.data.map((tx: any) => ({
          id: tx.id || tx.transaction_id,
          type: tx.type || tx.transaction_type,
          amount: Number.parseFloat(tx.amount || 0),
          currency: tx.currency || "USD",
          status: tx.status?.toLowerCase() || "processing",
          created_at: tx.created_at || tx.timestamp,
          description: tx.description || tx.memo,
        }))
        setTransactions(transformedTransactions)
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
      setTransactions([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleRefresh = () => {
    loadTransactions()
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "successful":
      case "completed":
        return <SuccessfulBadge />
      case "failed":
      case "rejected":
        return <FailedBadge />
      default:
        return <ProcessingBadge />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const sign = type === "deposit" || type === "credit" ? "+" : "-"
    return `${sign}${Math.abs(amount).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh transactions"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
          <p className="text-muted-foreground">Your transaction history will appear here once you start trading.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium capitalize">{transaction.type.replace("_", " ")}</h3>
                  {renderStatusBadge(transaction.status)}
                </div>

                {transaction.description && (
                  <p className="text-sm text-muted-foreground mb-1">{transaction.description}</p>
                )}

                <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
              </div>

              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    transaction.type === "deposit" || transaction.type === "credit" ? "text-green-600" : "text-red-600",
                  )}
                >
                  {formatAmount(transaction.amount, transaction.type)} {transaction.currency}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
