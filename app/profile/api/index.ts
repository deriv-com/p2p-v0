import { PaymentMethodsAPI } from "./api-payment-methods"
import { fetchUserStats } from "./api-user-stats"

export const ProfileAPI = {
  PaymentMethods: PaymentMethodsAPI,
  UserStats: {
    fetchUserStats,
  },
}

export * as PaymentMethods from "./api-payment-methods"
export * as UserStats from "./api-user-stats"
