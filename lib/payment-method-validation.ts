export const MPESA_NUMERIC_ACCOUNT_METHODS = new Set([
  "mpesa_tanzania",
  "safaricom_mpesa",
  "vodacom_m_pesa",
])

export const PAYMENT_METHOD_ACCOUNT_MAX_LENGTH = 50

export type PaymentMethodAccountValidationIssue = "numbersOnly" | "tooLong"

export function isMpesaPaymentMethod(method: string): boolean {
  return MPESA_NUMERIC_ACCOUNT_METHODS.has(method.toLowerCase())
}

export function requiresNumericAccountField(method: string, fieldName: string): boolean {
  return fieldName === "account" && isMpesaPaymentMethod(method)
}

export function sanitizeNumericAccountInput(value: string): string {
  return value.replace(/\D/g, "")
}

export function isDigitsOnly(value: string): boolean {
  return /^\d+$/.test(value)
}

export function hasInvalidLegacyMpesaAccountNumber(
  method: string,
  account: string | null | undefined,
): boolean {
  if (!isMpesaPaymentMethod(method)) return false

  const trimmed = account?.trim() ?? ""
  if (!trimmed) return false

  return !isDigitsOnly(trimmed)
}

export function getPaymentMethodAccountValidationIssue(
  method: string,
  fieldName: string,
  value: string,
): PaymentMethodAccountValidationIssue | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (requiresNumericAccountField(method, fieldName) && !isDigitsOnly(trimmed)) {
    return "numbersOnly"
  }

  if (fieldName === "account" && trimmed.length > PAYMENT_METHOD_ACCOUNT_MAX_LENGTH) {
    return "tooLong"
  }

  return null
}
