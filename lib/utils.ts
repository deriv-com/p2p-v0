import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
