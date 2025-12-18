import { useUserDataStore } from "@/stores/user-data-store"

let USER_DATA = null
let USER_TOKEN = null
let USER_ID = null
let SOCKET_TOKEN = null
let CLIENT_ID = null

if (typeof window !== "undefined") {
  USER_TOKEN = localStorage.getItem("auth_token") ?? ""

  USER_DATA = useUserDataStore.getState().userData

  USER_ID = useUserDataStore.getState().userId ?? ""

  SOCKET_TOKEN = localStorage.getItem("socket_token") ?? ""

  CLIENT_ID = useUserDataStore.getState().clientId ?? ""
}

export const USER = {
  id: USER_ID,
  advertsAreListed: USER_DATA?.adverts_are_listed,
  first_name: USER_DATA?.first_name,
  last_name: USER_DATA?.last_name,
  email: USER_DATA?.email,
  wallet_id: USER_DATA?.wallet_id,
  nickname: USER_DATA?.nickname,
  socketToken: SOCKET_TOKEN,
  userToken: USER_TOKEN,
}

export const API = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  coreUrl: process.env.NEXT_PUBLIC_CORE_URL,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
  notificationUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
  endpoints: {
    ads: "/adverts",
    orders: "/orders",
    profile: "/profile",
    balance: "/balance",
    paymentMethods: "/payment-methods",
    availablePaymentMethods: "/available-payment-methods",
    userPaymentMethods: "/user-payment-methods",
    advertisers: "/users",
    transactions: "/transactions",
    userFavourites: "/user-favourites",
    userBlocks: "/user-blocks",
    walletsTransactions: "/wallets/transactions",
  },
}

export const WALLETS = {
  cashierUrl: process.env.NEXT_PUBLIC_CASHIER_URL,
  defaultParams: {
    wallet_id: USER_DATA?.balances?.find((b) => b.currency === "USD")?.wallet_id,
    user_id: CLIENT_ID || "",
    operation: "DEPOSIT",
    currency: "USD",
    brand_id: USER_DATA?.brand || "",
  },
}

export const AUTH = {
  getAuthHeader: () => ({
    "Content-Type": "application/json",
  }),

  getNotificationHeader: () => ({
    "Content-Type": "application/json",
  }),
}

export const APP_SETTINGS = {
  defaultCurrency: "USD",
  supportedCurrencies: ["USD", "EUR", "GBP", "IDR"],
  defaultLanguage: "EN",
  supportedLanguages: ["EN", "ES", "FR", "ID", "IT", "PT"],
}

export const NOTIFICATIONS = {
  applicationId: process.env.NEXT_PUBLIC_NOTIFICATION_APPLICATION_ID,
  subscriberHashUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
}

export default {
  USER,
  API,
  APP_SETTINGS,
  AUTH,
  NOTIFICATIONS,
  WALLETS,
}
