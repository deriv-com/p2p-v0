export interface AdFormData {
  id?: string
  type?: "buy" | "sell"
  priceType?: "fixed" | "float"
  totalAmount?: number
  fixedRate?: number
  floatingRate?: number | string
  minAmount?: number
  maxAmount?: number
  paymentMethods?: string[]
  payment_method_ids?: number[]
  instructions?: string
  forCurrency?: string
  buyCurrency?: string
  order_expiry_period?: number
  available_countries?: string[]
  minimum_trade_band?: "bronze" | "silver" | "gold" | "diamond" | null
  visibility_status?: string[]
}
