import {
  isDigitsOnly,
  isMpesaPaymentMethod,
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
  })
})
