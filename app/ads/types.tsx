export interface AdFormData {
  // Step 1: Ad Details
  type: "buy" | "sell"
  totalAmount: number
  fixedRate: number
  minAmount: number
  maxAmount: number

  // Step 2: Payment Details
  paymentMethods: string[]
  instructions: string
}

export interface MyAd {
  id: string
  type: "Buy" | "Sell"
  rate: {
    value: string
    percentage: string
    currency: string
  }
  limits: {
    min: number
    max: number
    currency: string
  }
  available: {
    current: number
    total: number
    currency: string
  }
  paymentMethods: string[]
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string
}

export interface Ad {
  id: string
  type?: string
  exchange_rate?: number
  rate?: {
    value: string
    percentage: string
    currency: string
  }
  minimum_order_amount?: number
  maximum_order_amount?: number
  actual_maximum_order_amount?: number
  limits?:
    | string
    | {
        min: number
        max: number
        currency: string
      }
  available_amount?: string
  open_order_amount?: string
  completed_order_amount?: string
  available?: {
    current: string
    total: string
  }
  payment_methods?: string[]
  paymentMethods?: string[]
  is_active?: boolean
  status?: "Active" | "Inactive"
  description?: string
  created_at?: number
  updated_at?: number
}
