import type { Advertisement } from "@/services/api/api-buy-sell"

export type RiskWarningType = "high_block_count" | "low_completion_rate"

export const HIGH_BLOCK_COUNT_THRESHOLD = 30
export const LOW_COMPLETION_RATE_THRESHOLD = 80
export const MIN_ORDER_COUNT_FOR_WARNING = 10

export interface RiskWarningResult {
  type: RiskWarningType
  isBuyAdvert: boolean
  completionRate?: number
  orderCount?: number
  blockCount?: number
}

export function evaluateRisk(ad: Advertisement): RiskWarningResult | null {
  const isBuyAdvert = ad.type === "buy"
  const blockCount = ad.user.blocked_by_count ?? 0

  if (blockCount >= HIGH_BLOCK_COUNT_THRESHOLD) {
    return { type: "high_block_count", isBuyAdvert, blockCount }
  }

  const rate = isBuyAdvert
    ? ad.user.completion_rate_sell_30day
    : ad.user.completion_rate_buy_30day
  const count =
    (ad.user.order_count_buy_30day ?? 0) + (ad.user.order_count_sell_30day ?? 0)

  if (rate == null) return null
  if (rate < LOW_COMPLETION_RATE_THRESHOLD && count >= MIN_ORDER_COUNT_FOR_WARNING) {
    return {
      type: "low_completion_rate",
      isBuyAdvert,
      completionRate: rate,
      orderCount: count,
    }
  }
  return null
}
