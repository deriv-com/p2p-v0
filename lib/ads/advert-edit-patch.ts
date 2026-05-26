import type { AdFormData } from "@/app/ads/types"

export type MinimumTradeBand = "silver" | "gold" | "diamond" | null

export interface AdvertEditSnapshot {
  advertType: "buy" | "sell"
  minOrderAmount: number
  maxOrderAmount: number
  exchangeRate: number
  exchangeRateType: "fixed" | "float"
  orderExpiryPeriod: number
  availableCountries: string[]
  minimumTradeBand: MinimumTradeBand
  isPrivate: boolean
  instructions: string
  paymentMethodNames: string[]
  paymentMethodIds: number[]
}

export function normalizeTradeBandForComparison(
  band: string | null | undefined,
): MinimumTradeBand {
  if (!band || band === "bronze") return null
  if (band === "silver" || band === "gold" || band === "diamond") return band
  return null
}

export function tradeBandForApi(band: MinimumTradeBand): string {
  return band ?? "bronze"
}

export function createAdvertEditSnapshot(params: {
  type: "buy" | "sell"
  minimumOrderAmount: number
  maximumOrderAmount: number
  exchangeRate: number
  exchangeRateType: "fixed" | "float"
  orderExpiryPeriod: number
  availableCountries?: string[] | null
  minimumTradeBand?: string | null
  isPrivate: boolean
  description?: string | null
  paymentMethodNames: string[]
  paymentMethodIds: number[]
}): AdvertEditSnapshot {
  return {
    advertType: params.type,
    minOrderAmount: params.minimumOrderAmount,
    maxOrderAmount: params.maximumOrderAmount,
    exchangeRate: params.exchangeRate,
    exchangeRateType: params.exchangeRateType,
    orderExpiryPeriod: params.orderExpiryPeriod,
    availableCountries: params.availableCountries ?? [],
    minimumTradeBand: normalizeTradeBandForComparison(params.minimumTradeBand),
    isPrivate: params.isPrivate,
    instructions: (params.description ?? "").trim(),
    paymentMethodNames: params.paymentMethodNames,
    paymentMethodIds: params.paymentMethodIds,
  }
}

export function buildCurrentEditState(
  formData: Partial<AdFormData>,
  options: {
    orderTimeLimit: number
    selectedCountries: string[]
    minimumTradeBand: MinimumTradeBand
    isPrivate: boolean
    selectedPaymentMethodIds: (string | number)[]
  },
): AdvertEditSnapshot {
  const priceType = (formData.priceType as string) || "fixed"
  const exchangeRate =
    priceType === "float"
      ? Number(formData.floatingRate)
      : Number(formData.fixedRate)

  const paymentMethodIds = options.selectedPaymentMethodIds
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id))

  const advertType = (formData.type as "buy" | "sell") || "buy"

  return {
    advertType,
    minOrderAmount: Number(formData.minAmount) || 0,
    maxOrderAmount: Number(formData.maxAmount) || 0,
    exchangeRate: exchangeRate || 0,
    exchangeRateType: priceType as "fixed" | "float",
    orderExpiryPeriod: options.orderTimeLimit,
    availableCountries: options.selectedCountries,
    minimumTradeBand: options.minimumTradeBand,
    isPrivate: options.isPrivate,
    instructions: String(formData.instructions ?? "").trim(),
    paymentMethodNames:
      advertType === "buy"
        ? ((formData.paymentMethods as string[]) ?? [])
        : [],
    paymentMethodIds: advertType === "sell" ? paymentMethodIds : [],
  }
}

const doublesEqual = (a: number, b: number) => Math.abs(a - b) < 1e-9

const stringListsEqual = (a: string[], b: string[]) => {
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.length === sortedB.length && sortedA.every((value, index) => value === sortedB[index])
}

const intListsEqual = (a: number[], b: number[]) => {
  const sortedA = [...a].sort((x, y) => x - y)
  const sortedB = [...b].sort((x, y) => x - y)
  return sortedA.length === sortedB.length && sortedA.every((value, index) => value === sortedB[index])
}

/** Builds a PATCH payload containing only advert fields that changed in edit mode. */
export function buildAdvertEditPatch(
  original: AdvertEditSnapshot,
  current: AdvertEditSnapshot,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {}

  if (!doublesEqual(current.minOrderAmount, original.minOrderAmount)) {
    patch.minimum_order_amount = current.minOrderAmount
  }

  if (!doublesEqual(current.maxOrderAmount, original.maxOrderAmount)) {
    patch.maximum_order_amount = current.maxOrderAmount
  }

  if (!doublesEqual(current.exchangeRate, original.exchangeRate)) {
    patch.exchange_rate = current.exchangeRate
  }

  if (current.exchangeRateType !== original.exchangeRateType) {
    patch.exchange_rate_type = current.exchangeRateType
  }

  if (current.orderExpiryPeriod !== original.orderExpiryPeriod) {
    patch.order_expiry_period = current.orderExpiryPeriod
  }

  if (!stringListsEqual(current.availableCountries, original.availableCountries)) {
    patch.available_countries = current.availableCountries
  }

  if (current.instructions !== original.instructions) {
    patch.description = current.instructions.length === 0 ? null : current.instructions
  }

  if (current.isPrivate !== original.isPrivate) {
    patch.is_private = current.isPrivate
  }

  const currentBand = normalizeTradeBandForComparison(current.minimumTradeBand)
  if (currentBand !== original.minimumTradeBand) {
    patch.minimum_trade_band = tradeBandForApi(current.minimumTradeBand)
  }

  if (current.advertType === "buy") {
    if (!stringListsEqual(current.paymentMethodNames, original.paymentMethodNames)) {
      patch.payment_method_names = current.paymentMethodNames
    }
  } else if (!intListsEqual(current.paymentMethodIds, original.paymentMethodIds)) {
    patch.payment_method_ids = current.paymentMethodIds
  }

  return patch
}

export function hasAdvertEditChanges(
  original: AdvertEditSnapshot,
  current: AdvertEditSnapshot,
): boolean {
  return Object.keys(buildAdvertEditPatch(original, current)).length > 0
}

/** Normalizes only keys present on a partial PATCH payload. */
export function normalizeUpdateAdPayload(
  adData: Record<string, unknown>,
): Record<string, unknown> {
  const payload = { ...adData }

  if (Object.prototype.hasOwnProperty.call(payload, "payment_method_names")) {
    const names = payload.payment_method_names
    if (!Array.isArray(names)) {
      payload.payment_method_names = [String(names)]
    } else {
      payload.payment_method_names = names.map((method) => String(method))
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "payment_method_ids")) {
    if (payload.payment_method_ids == null) {
      payload.payment_method_ids = null
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "available_countries")) {
    if (payload.available_countries == null) {
      payload.available_countries = null
    }
  }

  return payload
}
