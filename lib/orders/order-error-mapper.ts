import { OrderErrorAction, type OrderErrorMessage } from "./order-error-actions"

type Translator = (key: string, params?: Record<string, unknown>) => string

export interface OrderErrorMapCtx {
  isBuyAdvert?: boolean
  accountCurrency?: string
  paymentCurrency?: string
  detail?: Record<string, unknown> | null
  payDisplay?: string
  accDisplay?: string
}

export function mapOrderError(
  code: string,
  t: Translator,
  _ctx: OrderErrorMapCtx = {},
): OrderErrorMessage {
  switch (code) {
    default:
      return {
        title: t("order.unableToCreateOrder"),
        message: code
          ? `${t("order.orderCreationError")} (${code})`
          : t("order.orderCreationError"),
        primaryCta: t("common.ok"),
        primaryAction: OrderErrorAction.Dismiss,
      }
  }
}
