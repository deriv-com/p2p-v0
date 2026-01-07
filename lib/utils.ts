import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface AvailablePaymentMethod {
  id: number
  method: string
  display_name: string
  type: string
  fields: Record<
    string,
    {
      display_name: string
      required: boolean
      value?: string
    }
  >
}

interface PaymentMethodField {
  name: string
  label: string
  type: string
  required: boolean
}

export function getPaymentMethodFields(
  method: string,
  availablePaymentMethods: AvailablePaymentMethod[],
): PaymentMethodField[] {
  const paymentMethod = availablePaymentMethods.find((pm) => pm.method === method)
  if (!paymentMethod) return []

  return Object.entries(paymentMethod.fields)
    .filter(([key]) => key !== "instructions")
    .map(([key, field]) => ({
      name: key,
      label: field.display_name,
      type: "text",
      required: field.required,
    }))
}

export function getPaymentMethodIcon(type: string): string {
  return type === "ewallet" ? "/icons/ewallet-icon-new.png" : "/icons/bank-transfer-icon.png"
}

export function getPaymentMethodColour(type: string): string {
  switch (type) {
    case "bank":
      return "bg-paymentMethod-bank"
    case "ewallet":
      return "bg-paymentMethod-ewallet"
    default:
      return "bg-paymentMethod-ewallet"
  }
}

export function getPaymentMethodColourByName(methodName: string): string {
  const lowerMethod = methodName.toLowerCase()
  if (lowerMethod.includes("bank") || lowerMethod.includes("transfer")) {
    return "bg-paymentMethod-bank"
  }
  return "bg-paymentMethod-ewallet"
}

export function getCategoryDisplayName(type: string): string {
  switch (type) {
    case "bank":
      return "Bank transfer"
    case "ewallet":
      return "eWallet"
    default:
      return "Other"
  }
}

export const maskAccountNumber = (accountNumber: any): string => {
  if (!accountNumber) return ""

  let rawValue = accountNumber

  if (typeof accountNumber === "object" && accountNumber !== null) {
    if ("value" in accountNumber) {
      rawValue = accountNumber.value
    }
  }

  const accountStr = String(rawValue)

  if (accountStr.length <= 4) {
    return accountStr
  }

  return "*".repeat(accountStr.length - 4) + accountStr.slice(-4)
}

export function formatPaymentMethodName(methodName: string): string {
  if (!methodName) return ""

  if (methodName === "bank_transfer") {
    return "Bank transfer"
  }

  return methodName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function getMethodDisplayDetails(method: {
  type: string
  fields: Record<string, any>
  display_name: string
}) {
  if (method.type === "bank") {
    const account = method.fields.account?.value || ""
    const bankName = method.fields.bank_name?.value || "Bank transfer"
    const maskedAccount = maskAccountNumber(account)

    return {
      primary: maskedAccount,
      secondary: bankName,
    }
  } else {
    const account = method.fields.account?.value || ""
    const displayValue = account || method.display_name

    return {
      primary: displayValue,
      secondary: method.display_name,
    }
  }
}

export function formatStatus(
  isDetailed: boolean,
  status: string,
  isBuyer: boolean,
  t?: (key: string) => string,
): string {
  if (!status) return ""

  // If no translation function provided, use fallback English text
  if (!t) {
    const statusMap: Record<string, string> = {
      refunded: "Refunded",
      cancelled: isDetailed ? "Order cancelled" : "Cancelled",
      timed_out: isDetailed ? "Order expired" : "Expired",
      completed: isDetailed ? "Order complete" : "Completed",
      pending_payment: isBuyer ? "Complete payment" : "Awaiting payment",
      pending_release: isBuyer ? "Waiting seller's confirmation" : "Confirm payment",
      disputed: "Under dispute",
    }

    const lowerStatus = status.toLowerCase()
    if (statusMap[lowerStatus]) {
      return statusMap[lowerStatus]
    }

    return status
  }

  // Use translation keys
  const lowerStatus = status.toLowerCase()

  switch (lowerStatus) {
    case "refunded":
      return t("status.refunded")
    case "cancelled":
      return isDetailed ? t("status.orderCancelled") : t("status.cancelled")
    case "timed_out":
      return isDetailed ? t("status.orderExpired") : t("status.timedOut")
    case "completed":
      return isDetailed ? t("status.orderComplete") : t("status.completed")
    case "pending_payment":
      return isBuyer ? t("status.completePayment") : t("status.awaitingPayment")
    case "pending_release":
      return isBuyer ? t("status.waitingSellersConfirmation") : t("status.confirmPayment")
    case "disputed":
      return t("status.underDispute")
    default:
      return status
  }
}

export function getStatusBadgeStyle(status: string, type: string): string {
  switch (status) {
    case "pending_payment":
      return type === "buy" ? "bg-blue-50 text-blue-100" : "bg-yellow-100 text-yellow-50"
    case "pending_release":
      return type === "buy" ? "bg-yellow-100 text-yellow-50" : "bg-blue-50 text-blue-100"
    case "completed":
      return "bg-green-50 text-buy"
    case "cancelled":
      return "bg-slate-100 text-slate-800"
    case "disputed":
      return "bg-red-100 text-red-700"
    case "timed_out":
      return "bg-slate-100 text-slate-800"
    default:
      return "bg-blue-50 text-blue-100"
  }
}

export function getChatErrorMessage(tags: string[], t?: (key: string) => string): string {
  if (!t) {
    const messageTypeFormatters: Record<string, string> = {
      pii: "Please avoid sharing personal information like phone numbers, addresses, or ID details for your security.",
      link: "Links and URLs are not permitted in this chat.",
      profanity: "Please keep the conversation professional and avoid offensive language.",
      promotional_content: "Promotional content and advertisements are not allowed.",
      off_platform_communication:
        "Please keep the conversation within this platform. We cannot assist with requests to communicate elsewhere.",
      human_attention: "Threatening or harassing language is not tolerated. Please communicate respectfully.",
      harassment: "Please do not impersonate Deriv staff or misrepresent your identity.",
      fake_identity:
        "Never share passwords, OTPs, or login credentials. Deriv staff will never ask for this information in chat.",
      sensitive_data_requests:
        "Your message requires additional review. Please wait while we connect you with a specialist.",
      miscellaneous: "Your message doesn't meet our community guidelines. Please try again.",
    }

    const message = tags.length > 1 ? "It violates our chat guidelines." : messageTypeFormatters[tags[0]]
    return message
  }

  // Use translation keys
  const messageTypeKeys: Record<string, string> = {
    pii: "chat.errorPii",
    link: "chat.errorLink",
    profanity: "chat.errorProfanity",
    promotional_content: "chat.errorPromotionalContent",
    off_platform_communication: "chat.errorOffPlatformCommunication",
    human_attention: "chat.errorHumanAttention",
    harassment: "chat.errorHarassment",
    fake_identity: "chat.errorFakeIdentity",
    sensitive_data_requests: "chat.errorSensitiveDataRequests",
    miscellaneous: "chat.errorMiscellaneous",
  }

  if (tags.length > 1) {
    return t("chat.errorMultipleViolations")
  }

  const key = messageTypeKeys[tags[0]]
  return t(key)
}

export function formatAmount(amount: string): string {
  return amount?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "0.00"
}

export function formatAmountWithDecimals(amount: number | string, decimals = 2): string {
  const strAmount = String(amount)

  if (Number(strAmount) === 0) return "0.00"

  const [whole, decimal] = strAmount.split(".")
  const wholeWithCommas = Number(whole).toLocaleString("en-US")

  if (decimals === 0) {
    return wholeWithCommas
  }

  if (decimal !== undefined) {
    const truncatedDecimal = decimal.slice(0, decimals)
    return `${wholeWithCommas}.${truncatedDecimal.padEnd(decimals, "0")}`
  }

  return `${wholeWithCommas}.${"0".repeat(decimals)}`
}

export function formatDateTime(datetime) {
  const d = new Date(datetime)

  return d
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "")
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error("Failed to copy text: ", err)
    return false
  }
}

export function preventSwipeNavigation(): () => void {
  let startX = 0
  let startY = 0
  let isHorizontalSwipe = false

  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as Element

    if (
      target.closest("[data-sidebar]") ||
      target.closest(".fixed.bottom-0") ||
      target.closest('[role="dialog"]') ||
      target.closest(".sheet-content")
    ) {
      return
    }

    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    isHorizontalSwipe = false

    if (startX < 50 || startX > window.innerWidth - 50) {
      e.preventDefault()
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    const target = e.target as Element

    if (
      target.closest("[data-sidebar]") ||
      target.closest(".fixed.bottom-0") ||
      target.closest('[role="dialog"]') ||
      target.closest(".sheet-content")
    ) {
      return
    }

    if (!startX || !startY) {
      return
    }

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = Math.abs(startX - currentX)
    const diffY = Math.abs(startY - currentY)

    if (diffX > diffY && diffX > 10) {
      isHorizontalSwipe = true
    }

    if (isHorizontalSwipe && (startX < 50 || startX > window.innerWidth - 50)) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const target = e.target as Element

    if (
      target.closest("[data-sidebar]") ||
      target.closest(".fixed.bottom-0") ||
      target.closest('[role="dialog"]') ||
      target.closest(".sheet-content")
    ) {
      return
    }

    if (isHorizontalSwipe && (startX < 50 || startX > window.innerWidth - 50)) {
      e.preventDefault()
      e.stopPropagation()
    }

    startX = 0
    startY = 0
    isHorizontalSwipe = false
  }

  const handleGestureStart = (e: Event) => {
    const target = e.target as Element

    if (
      target.closest("[data-sidebar]") ||
      target.closest(".fixed.bottom-0") ||
      target.closest('[role="dialog"]') ||
      target.closest(".sheet-content")
    ) {
      return
    }

    e.preventDefault()
  }

  const handleGestureChange = (e: Event) => {
    const target = e.target as Element

    if (
      target.closest("[data-sidebar]") ||
      target.closest(".fixed.bottom-0") ||
      target.closest('[role="dialog"]') ||
      target.closest(".sheet-content")
    ) {
      return
    }

    e.preventDefault()
  }

  const handleGestureEnd = (e: Event) => {
    const target = e.target as Element

    if (
      target.closest("[data-sidebar]") ||
      target.closest(".fixed.bottom-0") ||
      target.closest('[role="dialog"]') ||
      target.closest(".sheet-content")
    ) {
      return
    }

    e.preventDefault()
  }

  document.addEventListener("touchstart", handleTouchStart, { passive: false })
  document.addEventListener("touchmove", handleTouchMove, { passive: false })
  document.addEventListener("touchend", handleTouchEnd, { passive: false })

  document.addEventListener("gesturestart", handleGestureStart, { passive: false })
  document.addEventListener("gesturechange", handleGestureChange, { passive: false })
  document.addEventListener("gestureend", handleGestureEnd, { passive: false })

  document.body.style.overscrollBehaviorX = "none"

  return () => {
    document.removeEventListener("touchstart", handleTouchStart)
    document.removeEventListener("touchmove", handleTouchMove)
    document.removeEventListener("touchend", handleTouchEnd)
    document.removeEventListener("gesturestart", handleGestureStart)
    document.removeEventListener("gesturechange", handleGestureChange)
    document.removeEventListener("gestureend", handleGestureEnd)

    document.body.style.overscrollBehaviorX = "auto"
  }
}

export const currencyLogoMapper = {
  USD: "/icons/usd-flag.png",
  BTC: "/icons/bitcoin-logo.png",
  ETH: "/icons/ethereum-logo.png",
  LTC: "/icons/litecoin-logo.png",
  USDC: "/icons/usdc-logo.png",
  eUSDT: "/icons/eusdt-logo.png",
  tUSDT: "/icons/eusdt-logo.png",
  BNB: "/icons/bnb-logo.png",
  AED: "/icons/aed-logo.png",
  USDT: "/icons/eusdt-logo.png",
  TRX: "/icons/trx-logo.png",
}

export const currencyFlagMapper = {
  USD: "/icons/flag-usa.png",
  AMD: "/icons/flag-armenia.png",
  ALL: "/icons/flag-albania.png",
  ARS: "/icons/flag-argentina.png",
  BHD: "/icons/flag-bahrain.svg",
  BSD: "/icons/flag-bahamas.png",
  XAF: "/icons/flag-central-african-republic.png",
  CLP: "/icons/flag-chile.png",
  CRC: "/icons/flag-costa-rica.svg",
  JOD: "/icons/flag-jordan.svg",
  KHR: "/icons/flag-cambodia.svg",
  SOS: "/icons/flag-somalia.svg",
  SVC: "/icons/flag-el-salvador.png",
  ETB: "/icons/flag-ethiopia.png",
  KWD: "/icons/flag-kuwait.png",
  NPR: "/icons/flag-nepal.png",
  XOF: "/icons/flag-niger.png",
  OMR: "/icons/flag-oman.png",
  VES: "/icons/flag-venezuela.png",
  TND: "/icons/flag-tunisia.png",
  CNY: "/icons/flag-china.png",
  DOP: "/icons/flag-dominican-republic.png",
  EUR: "/icons/flag-tunisia.png",
  HTG: "/icons/flag-haiti.png",
  KZT: "/icons/flag-kazakhstan.png",
  LRD: "/icons/flag-liberia.png",
  MNT: "/icons/flag-mongolia.png",
  SLL: "/icons/flag-tunisia.png",
  TRY: "/icons/flag-tunisia.png",
  XCD: "/icons/flag-tunisia.png",
}

export const getHomeUrl = (isV1Signup = false, section = "", isWalletAccount = false, fromParam = "") => {
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production"
  let baseUrl = "",
    url = ""

  if (isV1Signup) {
    baseUrl = isProduction ? "app.deriv.com" : "staging-app.deriv.com"
  } else {
    baseUrl = isProduction ? "home.deriv.com" : "staging-home.deriv.com"
  }

  if (section === "poi") {
    if (isV1Signup) {
      if(isWalletAccount) {
        url = isProduction ? "https://hub.deriv.com/Accounts/ProofOfIdentityStatus" : "https://staging-hub.deriv.com/Accounts/ProofOfIdentityStatus"
      } else {
        url = isProduction ? "https://app.deriv.com/account/proof-of-identity" : "https://staging-app.deriv.com/account/proof-of-identity"
      }
    } else {
      url = `https://${baseUrl}/dashboard/kyc/confirm-detail?is_from_p2p=true&${fromParam}`
    }
  } else if (section === "poa") {
    if (isV1Signup) {
      if(isWalletAccount) {
        url = isProduction ? "https://hub.deriv.com/Accounts/ProofOfAddress" : "https://staging-hub.deriv.com/Accounts/ProofOfAddress"
      } else {
        url = isProduction ? "https://app.deriv.com/account/proof-of-address" : "https://staging-app.deriv.com/account/proof-of-address"
      }
    } else {
      url = `https://${baseUrl}/dashboard/kyc/address?is_from_p2p=true&${fromParam}`
    }
  } else if (section === "home") {
    if (isV1Signup) {
      url = `https://${baseUrl}`
    } else {
      url = `https://${baseUrl}/dashboard/home`
    }
  } else {
    url = baseUrl
  }

  return url
}

export const getLoginUrl = (isV1Signup = false) => {
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production"

  if (isV1Signup) {
    return isProduction ? "https://app.deriv.com" : "https://staging-app.deriv.com"
  }

  return isProduction ? "https://home.deriv.com/dashboard/login" : "https://staging-home.deriv.com/dashboard/login"
}
