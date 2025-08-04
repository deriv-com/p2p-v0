export interface AdFormData {
  type: "buy" | "sell"
  totalAmount: number
  fixedRate: number
  minAmount: number
  maxAmount: number
  paymentMethods: string[]
  payment_method_ids?: number[]
  instructions: string
}

export interface StatusModalState {
  show: boolean
  type: "success" | "error" | "warning"
  title: string
  message: string
  subMessage?: string
  adType?: string
  adId?: string
  actionButtonText?: string
}
