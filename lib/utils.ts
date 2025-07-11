import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getPaymentMethodColour = (type: string): string => {
  switch (type.toLowerCase()) {
    case "bank_transfer":
    case "bank":
      return "bg-paymentMethod-bank"
    case "ewallet":
    case "e_wallet":
      return "bg-paymentMethod-ewallet"
    default:
      return "bg-paymentMethod-other"
  }
}
