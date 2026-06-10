import {
  getPaymentMethodAccountValidationIssue,
  hasInvalidLegacyMpesaAccountNumber,
  isDigitsOnly,
  isMpesaPaymentMethod,
  PAYMENT_METHOD_ACCOUNT_MAX_LENGTH,
  requiresNumericAccountField,
  sanitizeNumericAccountInput,
} from "@/lib/payment-method-validation"

describe("payment-method-validation", () => {
  describe("isMpesaPaymentMethod", () => {
    it("returns true for M-Pesa method keys", () => {
      expect(isMpesaPaymentMethod("mpesa_tanzania")).toBe(true)
      expect(isMpesaPaymentMethod("safaricom_mpesa")).toBe(true)
      expect(isMpesaPaymentMethod("vodacom_m_pesa")).toBe(true)
    })

    it("returns false for other payment methods", () => {
      expect(isMpesaPaymentMethod("bank_transfer")).toBe(false)
      expect(isMpesaPaymentMethod("paypal")).toBe(false)
    })

    it("matches M-Pesa keys case-insensitively", () => {
      expect(isMpesaPaymentMethod("Safaricom_Mpesa")).toBe(true)
      expect(isMpesaPaymentMethod("MPESA_TANZANIA")).toBe(true)
    })
  })

  describe("requiresNumericAccountField", () => {
    it("returns true only for M-Pesa account fields", () => {
      expect(requiresNumericAccountField("safaricom_mpesa", "account")).toBe(true)
      expect(requiresNumericAccountField("safaricom_mpesa", "instructions")).toBe(false)
      expect(requiresNumericAccountField("paypal", "account")).toBe(false)
    })
  })

  describe("sanitizeNumericAccountInput", () => {
    it("removes non-digit characters", () => {
      expect(sanitizeNumericAccountInput("12ab 34")).toBe("1234")
      expect(sanitizeNumericAccountInput("0712-345-678")).toBe("0712345678")
    })
  })

  describe("isDigitsOnly", () => {
    it("accepts digits and rejects other characters", () => {
      expect(isDigitsOnly("123456")).toBe(true)
      expect(isDigitsOnly("0712345678")).toBe(true)
      expect(isDigitsOnly("12a34")).toBe(false)
      expect(isDigitsOnly("")).toBe(false)
    })

    it("rejects whitespace-only strings", () => {
      expect(isDigitsOnly("   ")).toBe(false)
    })
  })

  describe("hasInvalidLegacyMpesaAccountNumber", () => {
    it("returns true for non-numeric legacy M-Pesa accounts", () => {
      expect(hasInvalidLegacyMpesaAccountNumber("safaricom_mpesa", "0712-abc")).toBe(true)
    })

    it("returns false for numeric M-Pesa accounts", () => {
      expect(hasInvalidLegacyMpesaAccountNumber("safaricom_mpesa", "0712345678")).toBe(false)
    })

    it("returns false for empty or non-M-Pesa methods", () => {
      expect(hasInvalidLegacyMpesaAccountNumber("safaricom_mpesa", "")).toBe(false)
      expect(hasInvalidLegacyMpesaAccountNumber("paypal", "abc-123")).toBe(false)
    })
  })

  describe("getPaymentMethodAccountValidationIssue", () => {
    it("returns numbersOnly for non-numeric M-Pesa account values", () => {
      expect(getPaymentMethodAccountValidationIssue("safaricom_mpesa", "account", "12a34")).toBe(
        "numbersOnly",
      )
    })

    it("returns tooLong when account exceeds max length", () => {
      const longAccount = "1".repeat(PAYMENT_METHOD_ACCOUNT_MAX_LENGTH + 1)
      expect(getPaymentMethodAccountValidationIssue("paypal", "account", longAccount)).toBe("tooLong")
    })

    it("returns null for valid account values", () => {
      expect(getPaymentMethodAccountValidationIssue("safaricom_mpesa", "account", "0712345678")).toBe(
        null,
      )
      expect(getPaymentMethodAccountValidationIssue("paypal", "account", "user@bank.com")).toBe(null)
    })

    it("returns null for empty values", () => {
      expect(getPaymentMethodAccountValidationIssue("safaricom_mpesa", "account", "")).toBe(null)
    })

    it("returns null for whitespace-only account values", () => {
      expect(getPaymentMethodAccountValidationIssue("safaricom_mpesa", "account", "   ")).toBe(null)
    })
  })
})
