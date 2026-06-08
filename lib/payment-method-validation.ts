export const MPESA_NUMERIC_ACCOUNT_METHODS = new Set([
  "mpesa_tanzania",
  "safaricom_mpesa",
  "vodacom_m_pesa",
])

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
