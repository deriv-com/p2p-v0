import { useUserDataStore } from "@/stores/user-data-store"
import { getCoreUrl } from "@/lib/get-core-url"
import { getSocketUrl } from "@/lib/get-socket-url"

let USER_TOKEN = null
let USER_ID = null
let SOCKET_TOKEN = null
let CLIENT_ID = null
let CORE_URL = ""
let SOCKET_URL = ""

if (typeof window !== "undefined") {
  USER_TOKEN = localStorage.getItem("auth_token") ?? ""

  USER_ID = useUserDataStore.getState().userId ?? ""

  SOCKET_TOKEN = localStorage.getItem("socket_token") ?? ""

  CLIENT_ID = useUserDataStore.getState().clientId ?? ""

  CORE_URL = getCoreUrl()
  SOCKET_URL = getSocketUrl()
}

const getUserData = () => {
  if (typeof window === "undefined") return null
  return useUserDataStore.getState().userData
}

export const USER = {
  get id() {
    return USER_ID
  },
  get advertsAreListed() {
    return getUserData()?.adverts_are_listed
  },
  get first_name() {
    return getUserData()?.first_name
  },
  get last_name() {
    return getUserData()?.last_name
  },
  get email() {
    return getUserData()?.email
  },
  get wallet_id() {
    return getUserData()?.wallet_id
  },
  get nickname() {
    return getUserData()?.nickname
  },
  get socketToken() {
    return SOCKET_TOKEN
  },
  get userToken() {
    return USER_TOKEN
  },
}

export const API = {
  baseUrl: `${CORE_URL}/p2p/v1`,
  coreUrl: `${CORE_URL}/v1`,
  socketUrl: `${SOCKET_URL}/p2p/v1/events`,
  notificationUrl: `${CORE_URL}/notifications/v1`,
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
  get cashierUrl() {
    return `${CORE_URL}/v1/cashier/url`
  },
  get defaultParams() {
    const userData = getUserData()
    return {
      wallet_id: userData?.wallet_id,
      user_id: CLIENT_ID || "",
      operation: "DEPOSIT",
      currency: "USD",
      brand_id: userData?.brand || "",
    }
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
  subscriberHashUrl: `${CORE_URL}/notifications/v1`,
}

export default {
  USER,
  API,
  APP_SETTINGS,
  AUTH,
  NOTIFICATIONS,
  WALLETS,
}
