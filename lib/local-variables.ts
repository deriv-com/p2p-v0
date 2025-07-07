let USER_DATA = null
let USER_ID = null
let SOCKET_TOKEN = null

if (typeof window !== "undefined") {
  USER_DATA = JSON.parse(localStorage.getItem("user_data") ?? "{}")
  USER_ID = localStorage.getItem("user_id") ?? ""
  SOCKET_TOKEN = localStorage.getItem("socket_token") ?? ""
}

export const USER = {
  id: USER_ID,
  nickname: USER_DATA?.nickname,
  socketToken: SOCKET_TOKEN,
}

export const API = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  coreUrl: process.env.NEXT_PUBLIC_CORE_URL,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
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
  },
}

export const WALLETS = {
  cashierUrl: process.env.NEXT_PUBLIC_CASHIER_URL,
  defaultParams: {
    wallet_id: USER_DATA?.balances?.find((b) => b.currency === "USD")?.wallet_id,
    user_id: USER_DATA?.external_user_id || "",
    operation: "DEPOSIT",
    currency: "USD",
    brand_id: USER_DATA?.brand_name || "",
  },
}

export const APP_SETTINGS = {
  defaultCurrency: "USD",
  supportedCurrencies: ["USD", "EUR", "GBP", "IDR"],
  defaultLanguage: "EN",
  supportedLanguages: ["EN", "ES", "FR", "ID"],
}

export const NOTIFICATIONS = {
  applicationId: process.env.NEXT_PUBLIC_NOTIFICATION_APPLICATION_ID,
  subscriberHashUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
}

export const AUTH = {
  isLoggedIn: !!USER_ID && !!USER_DATA?.nickname,
  token: SOCKET_TOKEN,
  userId: USER_ID,
  userData: USER_DATA,
  loginUrl: "/login",
  logoutUrl: "/logout",
}

export default {
  USER,
  API,
  APP_SETTINGS,
  NOTIFICATIONS,
  WALLETS,
  AUTH,
}
