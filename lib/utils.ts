import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface AvailablePaymentMethod {
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
  return type === "ewallet" ? "/icons/ewallet-icon.png" : "/icons/bank-transfer-icon.png"
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

export function formatStatus(status: string, type: string): string {
  if (!status) return ""

  const statusMap: Record<string, string> = {
    refunded: "Refunded",
    cancelled: "Cancelled",
    timed_out: "Expired",
    completed: "Complete",
    pending_payment: type === "buy" ? "Complete payment" : "Awaiting payment",
    pending_release: type === "buy" ? "Waiting seller's confirmation" : "Confirm payment",
    under_dispute: "Under dispute",
  }

  const lowerStatus = status.toLowerCase()
  if (statusMap[lowerStatus]) {
    return statusMap[lowerStatus]
  }

  return status
}

export function getChatErrorMessage(tag: string): string {

  const messageTypeFormatters: Record<string, (msg: string) => string> = {
    error: (msg: string) => `❌ Error: ${msg}`,
    success: (msg: string) => `✅ Success: ${msg}`,
    warning: (msg: string) => `⚠️ Warning: ${msg}`,
    info: (msg: string) => `ℹ️ Info: ${msg}`,
    notification: (msg: string) => `🔔 ${msg}`,
    system: (msg: string) => `🔧 System: ${msg}`,
    user: (msg: string) => msg,
    admin: (msg: string) => `👤 Admin: ${msg}`,
    trade: (msg: string) => `💱 Trade: ${msg}`,
    payment: (msg: string) => `💳 Payment: ${msg}`,
    order: (msg: string) => `📋 Order: ${msg}`,
    chat: (msg: string) => msg,
    default: (msg: string) => msg,
  }

  const formatter = messageTypeFormatters[tag]
  return messageTypeFormatters[tag]
}
