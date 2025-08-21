"use client"

import { useEffect } from "react"
import { getTransactions } from "@/services/api/api-wallets"

export default function TransactionsTab() {
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getTransactions()
        console.log("[v0] Transactions API response:", response)
      } catch (error) {
        console.error("[v0] Error fetching transactions:", error)
      }
    }

    fetchTransactions()
  }, [])

  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>Transactions will be displayed here</p>
    </div>
  )
}
