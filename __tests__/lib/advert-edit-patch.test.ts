import {
  buildAdvertEditPatch,
  buildCurrentEditState,
  createAdvertEditSnapshot,
  hasAdvertEditChanges,
  normalizeUpdateAdPayload,
  type AdvertEditSnapshot,
} from "@/lib/ads/advert-edit-patch"

const snapshot = (overrides: Partial<AdvertEditSnapshot> = {}): AdvertEditSnapshot => ({
  advertType: "buy",
  minOrderAmount: 10,
  maxOrderAmount: 100,
  exchangeRate: 16000,
  exchangeRateType: "fixed",
  orderExpiryPeriod: 30,
  availableCountries: [],
  minimumTradeBand: null,
  isPrivate: false,
  instructions: "",
  paymentMethodNames: ["bank_transfer"],
  paymentMethodIds: [],
  ...overrides,
})

describe("buildAdvertEditPatch", () => {
  it("returns empty object when nothing changed", () => {
    const original = snapshot()
    const current = snapshot()

    expect(buildAdvertEditPatch(original, current)).toEqual({})
    expect(hasAdvertEditChanges(original, current)).toBe(false)
  })

  it("includes only changed scalar fields", () => {
    const original = snapshot()
    const current = snapshot({
      minOrderAmount: 20,
      exchangeRate: 16500,
      orderExpiryPeriod: 45,
      instructions: "Updated note",
      isPrivate: true,
    })

    const patch = buildAdvertEditPatch(original, current)

    expect(patch).toMatchObject({
      minimum_order_amount: 20,
      exchange_rate: 16500,
      order_expiry_period: 45,
      description: "Updated note",
      is_private: true,
    })
    expect(patch).not.toHaveProperty("maximum_order_amount")
    expect(patch).not.toHaveProperty("is_active")
    expect(patch).not.toHaveProperty("available_amount")
  })

  it("sends null description when instructions are cleared", () => {
    const original = snapshot({ instructions: "Keep me" })
    const current = snapshot({ instructions: "" })

    expect(buildAdvertEditPatch(original, current)).toEqual({
      description: null,
    })
  })

  it("sends available_countries only when changed", () => {
    const original = snapshot({ availableCountries: ["MY"] })
    const unchanged = snapshot({ availableCountries: ["MY"] })
    const cleared = snapshot({ availableCountries: [] })

    expect(buildAdvertEditPatch(original, unchanged)).toEqual({})
    expect(buildAdvertEditPatch(original, cleared)).toEqual({
      available_countries: [],
    })
  })

  it("sends bronze when clearing minimum trade band restriction", () => {
    const original = snapshot({ minimumTradeBand: "diamond" })
    const current = snapshot({ minimumTradeBand: null })

    expect(buildAdvertEditPatch(original, current)).toEqual({
      minimum_trade_band: "bronze",
    })
  })

  it("treats bronze and null minimum trade band as unchanged", () => {
    const baseParams = {
      type: "buy" as const,
      minimumOrderAmount: 10,
      maximumOrderAmount: 100,
      exchangeRate: 16000,
      exchangeRateType: "fixed" as const,
      orderExpiryPeriod: 30,
      isPrivate: false,
      paymentMethodNames: ["bank_transfer"],
      paymentMethodIds: [],
    }

    const original = createAdvertEditSnapshot({
      ...baseParams,
      minimumTradeBand: null,
    })
    const current = createAdvertEditSnapshot({
      ...baseParams,
      minimumTradeBand: "bronze",
    })

    expect(buildAdvertEditPatch(original, current)).toEqual({})
  })

  it("includes payment_method_names only when buy methods changed", () => {
    const original = snapshot({ paymentMethodNames: ["bank_transfer"] })
    const current = snapshot({
      paymentMethodNames: ["bank_transfer", "ewallet"],
    })

    expect(buildAdvertEditPatch(original, current)).toEqual({
      payment_method_names: ["bank_transfer", "ewallet"],
    })
  })

  it("includes payment_method_ids only when sell methods changed", () => {
    const original = snapshot({
      advertType: "sell",
      paymentMethodNames: [],
      paymentMethodIds: [1, 2],
    })
    const current = snapshot({
      advertType: "sell",
      paymentMethodNames: [],
      paymentMethodIds: [1, 3],
    })

    const patch = buildAdvertEditPatch(original, current)

    expect(patch).toEqual({ payment_method_ids: [1, 3] })
    expect(patch).not.toHaveProperty("payment_method_names")
  })
})

describe("createAdvertEditSnapshot", () => {
  it("normalizes description and trade band from API values", () => {
    const result = createAdvertEditSnapshot({
      type: "buy",
      minimumOrderAmount: 10,
      maximumOrderAmount: 100,
      exchangeRate: 16000,
      exchangeRateType: "fixed",
      orderExpiryPeriod: 30,
      availableCountries: ["MY"],
      minimumTradeBand: "bronze",
      isPrivate: false,
      description: "  hello  ",
      paymentMethodNames: ["bank_transfer"],
      paymentMethodIds: [],
    })

    expect(result.instructions).toBe("hello")
    expect(result.minimumTradeBand).toBeNull()
    expect(result.availableCountries).toEqual(["MY"])
  })
})

describe("buildCurrentEditState", () => {
  it("maps form data and step-3 state into a comparable snapshot", () => {
    const current = buildCurrentEditState(
      {
        type: "sell",
        minAmount: 15,
        maxAmount: 150,
        priceType: "float",
        floatingRate: 2.5,
        instructions: " note ",
      },
      {
        orderTimeLimit: 45,
        selectedCountries: ["SG"],
        minimumTradeBand: "gold",
        isPrivate: true,
        selectedPaymentMethodIds: ["1", "2"],
      },
    )

    expect(current).toMatchObject({
      advertType: "sell",
      minOrderAmount: 15,
      maxOrderAmount: 150,
      exchangeRate: 2.5,
      exchangeRateType: "float",
      orderExpiryPeriod: 45,
      availableCountries: ["SG"],
      minimumTradeBand: "gold",
      isPrivate: true,
      instructions: "note",
      paymentMethodIds: [1, 2],
    })
  })
})

describe("normalizeUpdateAdPayload", () => {
  it("does not inject payment or country keys when absent", () => {
    const payload = normalizeUpdateAdPayload({
      minimum_order_amount: 20,
    })

    expect(payload).toEqual({ minimum_order_amount: 20 })
  })

  it("normalizes only keys present on the payload", () => {
    const payload = normalizeUpdateAdPayload({
      payment_method_names: "bank_transfer",
      payment_method_ids: null,
      available_countries: null,
    })

    expect(payload).toEqual({
      payment_method_names: ["bank_transfer"],
      payment_method_ids: null,
      available_countries: null,
    })
  })

  it("preserves empty available_countries array", () => {
    const payload = normalizeUpdateAdPayload({
      available_countries: [],
    })

    expect(payload).toEqual({ available_countries: [] })
  })
})
