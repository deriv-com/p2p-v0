import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function getPaymentMethodIcon(type: string): string | null {
  switch (type) {
    case "bank":
      return "/icons/bank-transfer-icon.png"
    case "ewallet":
      return "/icons/ewallet-icon.png"
    default:
      return null
  }
}

export function getCategoryDisplayName(type: string): string {
  switch (type) {
    case "bank":
      return "Bank Transfer"
    case "ewallet":
      return "E-Wallet"
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

export function getMethodDisplayDetails(method: any): { primary: string; secondary: string } {
  if (method.type === "bank") {
    return {
      primary: method.fields?.bank_name || method.display_name,
      secondary: method.fields?.account_number ? `****${method.fields.account_number.slice(-4)}` : "",
    }
  } else if (method.type === "ewallet") {
    return {
      primary: method.display_name,
      secondary: method.fields?.account_id || method.fields?.phone_number || "",
    }
  }

  return {
    primary: method.display_name,
    secondary: "",
  }
}
