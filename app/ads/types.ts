export interface AdFormData {
  id?: string
  type: "buy" | "sell"
  priceType?: "fixed" | "floating"
  totalAmount: number
  fixedRate?: number
  floatingRate?: number
  minAmount: number
  maxAmount: number
  paymentMethods?: string[]
  payment_method_ids?: string[]
  instructions?: string
  forCurrency: string
  buyCurrency: string
  order_expiry_period?: number
  available_countries?: string[]
}
