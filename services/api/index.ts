// Export all API services for easier imports
import * as AuthAPI from "./api-auth"
import * as AuthPrevAPI from "./api-auth-prev"
import * as BuySellAPI from "./api-buy-sell"
import * as OrdersAPI from "./api-orders"
import * as ProfileAPI from "./api-profile"
import { AdsAPI } from "@/app/ads/api/api-ads"

export { AuthAPI, AuthPrevAPI, BuySellAPI, OrdersAPI, AdsAPI, ProfileAPI }
