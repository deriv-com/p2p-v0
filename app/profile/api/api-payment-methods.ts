import { API, AUTH } from "@/lib/local-variables"

export const PaymentMethods = {
  async updatePaymentMethod(id: string, payload: any) {
    try {
      const url = `${API.baseUrl}/user-payment-methods/${id}`
      const headers = {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      }

      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse update payment method response:", e)
        return { success: false, errors: [{ message: "Invalid response format" }] }
      }

      if (data.error) {
        return {
          success: false,
          errors: data.error.details || [{ message: data.error.message || "Update failed" }],
        }
      }

      return { success: true, data: data.data }
    } catch (error) {
      console.error("Error updating payment method:", error)
      return {
        success: false,
        errors: [{ message: error instanceof Error ? error.message : "Network error occurred" }],
      }
    }
  },

  async deletePaymentMethod(id: string) {
    try {
      const url = `${API.baseUrl}/user-payment-methods/${id}`
      const headers = AUTH.getAuthHeader()

      const response = await fetch(url, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse delete payment method response:", e)
        return { success: false, errors: [{ message: "Invalid response format" }] }
      }

      if (data.error) {
        return {
          success: false,
          errors: data.error.details || [{ message: data.error.message || "Delete failed" }],
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Error deleting payment method:", error)
      return {
        success: false,
        errors: [{ message: error instanceof Error ? error.message : "Network error occurred" }],
      }
    }
  },

  async addPaymentMethod(method: string, fields: Record<string, string>) {
    try {
      const { ...cleanFields } = fields

      const finalFields = Object.fromEntries(
        Object.entries(cleanFields)
          .filter(([key, value]) => value != null)
          .map(([key, value]) => [key, String(value)]),
      )

      const requestBody = {
        data: {
          method,
          fields: finalFields,
        },
      }

      const url = `${API.baseUrl}/user-payment-methods`
      const headers = {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse add payment method response:", e)
        return { success: false, errors: [{ message: "Invalid response format" }] }
      }

      if (data.error) {
        return {
          success: false,
          errors: data.error.details || [{ message: data.error.message || "Add failed" }],
        }
      }

      return { success: true, data: data.data }
    } catch (error) {
      console.error("Error adding payment method:", error)
      return {
        success: false,
        errors: [{ message: error instanceof Error ? error.message : "Network error occurred" }],
      }
    }
  },
}
