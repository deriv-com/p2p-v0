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
  return type === "ewallet" ? "/icons/ewallet-icon-new.png" : "/icons/bank-transfericon.png"
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
    const bankName = method.fields.bank_name?.value || "Bank Transfer"
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

export function formatStatus(isDetailed: boolean, status: string, type: string): string {
  if (!status) return ""

  const statusMap: Record<string, string> = {
    refunded: "Refunded",
    cancelled: isDetailed ? "Order cancelled" : "Cancelled",
    timed_out: isDetailed ? "Order expired" : "Expired",
    completed: isDetailed ? "Order complete" : "Completed",
    pending_payment: type === "buy" ? "Complete payment" : "Awaiting payment",
    pending_release: type === "buy" ? "Waiting seller's confirmation" : "Confirm payment",
    disputed: "Under dispute",
  }

  const lowerStatus = status.toLowerCase()
  if (statusMap[lowerStatus]) {
    return statusMap[lowerStatus]
  }

  return status
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

export function getChatErrorMessage(tags: string[]): string {
  const messageTypeFormatters = {
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

export function formatAmount(amount: string) {
  return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
