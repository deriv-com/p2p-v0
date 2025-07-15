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

export function getPaymentMethodColour(type: string): string {
  switch (type) {
    case "bank":
      return "bg-paymentMethod-bank"
    case "ewallet":
      return "bg-paymentMethod-ewallet"
    default:
      return "bg-paymentMethod-other"
  }
}

export function getPaymentMethodColourByName(methodName: string): string {
  const lowerMethod = methodName.toLowerCase()
  if (lowerMethod.includes("bank") || lowerMethod.includes("transfer")) {
    return "bg-paymentMethod-bank"
  }
  return "bg-paymentMethod-other"
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

export function getChatErrorMessage(tags: string[]): string {
  const messageTypeFormatters = {
    pii: "Please avoid sharing personal information like phone numbers, addresses, or ID details for your security.",
    link: "Links and URLs are not permitted in this chat.",
    profanity: "Please keep the conversation professional and avoid offensive language.",
    promotional_content: "Promotional content and advertisements are not allowed.",
    off_platform_communication: "Please keep the conversation within this platform. We cannot assist with requests to communicate elsewhere.",
    human_attention: "Threatening or harassing language is not tolerated. Please communicate respectfully.",
    harassment: "Please do not impersonate Deriv staff or misrepresent your identity.",
    fake_identity: "Never share passwords, OTPs, or login credentials. Deriv staff will never ask for this information in chat.",
    sensitive_data_requests: "Your message requires additional review. Please wait while we connect you with a specialist.",
    miscellaneous: "Your message doesn't meet our community guidelines. Please try again."
  }

  const message = tags.length > 1 ? "It violates our chat guidelines." : messageTypeFormatters[tags[0]]

  return message
}

export function formatAmount(amount: string) {
  return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export function formatDateTime(datetime) {
  const d = new Date(datetime);
  
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
}
