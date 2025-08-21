import { AUTH } from "@/lib/local-variables"
import { process } from "process"

// Type definitions for transactions
export interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "transfer"
  amount: {
    value: number
    currency: string
  }
  status: "pending" | "completed" | "failed" | "cancelled"
  created_at: string
  updated_at: string
  description?: string
  reference?: string
  fee?: {
    value: number
    currency: string
  }
}

export interface TransactionFilters {
  type?: "deposit" | "withdrawal" | "transfer"
  status?: "pending" | "completed" | "failed" | "cancelled"
  currency?: string
  from_date?: string
  to_date?: string
  limit?: number
  offset?: number
}

export interface TransactionsResponse {
  data: Transaction[]
  total: number
  has_more: boolean
}

/**
 * Fetch user transactions
 * @param filters - Optional filters for transactions
 * @returns Promise with transactions data
 */
export async function getTransactions(filters?: TransactionFilters): Promise<TransactionsResponse> {
  try {
    const queryParams = new URLSearchParams()

    
    const walletId = "7c9d042b-bbf4-4ba8-89a8-ed41fabb82b2"
    if (walletId) {
      queryParams.append("wallet_id", walletId)
    }

    if (filters) {
      if (filters.type) queryParams.append("type", filters.type)
      if (filters.status) queryParams.append("status", filters.status)
      if (filters.currency) queryParams.append("currency", filters.currency)
      if (filters.from_date) queryParams.append("from_date", filters.from_date)
      if (filters.to_date) queryParams.append("to_date", filters.to_date)
      if (filters.limit) queryParams.append("limit", filters.limit.toString())
      if (filters.offset) queryParams.append("offset", filters.offset.toString())
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    const url = `https://staging-api.champion.trade/v1/wallets/transaction${queryString}`

    const headers = {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      throw new Error(`Error fetching transactions: ${response.statusText}`)
    }

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse transactions response:", e)
      data = { data: [], total: 0, has_more: false }
    }

    // Handle different response formats
    if (data && data.data && Array.isArray(data.data)) {
      return {
        data: data.data,
        total: data.total || data.data.length,
        has_more: data.has_more || false,
      }
    } else if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        has_more: false,
      }
    } else {
      return {
        data: [],
        total: 0,
        has_more: false,
      }
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw error
  }
}
