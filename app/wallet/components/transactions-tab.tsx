"use client"

import { useEffect } from "react"
import { fetchTransactions } from "@/services/api/api-wallets"

export default function TransactionsTab() {
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions()
        console.log("Transactions API response:", data)
      } catch (error) {
        console.error("Error loading transactions:", error)
      }
    }

    loadTransactions()
  }, [])

  return (
    <div className="p-4">
      <p>Transactions tab - check console for API response</p>
    </div>
  )
}
