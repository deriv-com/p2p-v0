import { useState, useEffect, useCallback } from "react"
import { API, AUTH } from "@/lib/local-variables"
import { ProfileAPI } from "@/services/api"
import { useTranslations } from "@/lib/i18n/use-translations"

export interface PaymentMethod {
  id: string
  name: string
  type: string
  category: "bank_transfer" | "e_wallet" | "other"
  details: Record<string, any>
  instructions?: string
  isDefault?: boolean
}

export function usePaymentMethods() {
  const { t } = useTranslations()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = `${API.baseUrl}/user-payment-methods`
      const headers = AUTH.getAuthHeader()
      const response = await fetch(url, {
        headers,
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status === 401) {
          setPaymentMethods([])
          return
        }
        throw new Error(`Error fetching payment methods: ${response.statusText}`)
      }

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse payment methods response:", e)
        data = { data: [] }
      }

      const methodsData = data.data || []

      const transformedMethods = methodsData.map((method: any) => {
        const methodType = method.method || ""
        let category: "bank_transfer" | "e_wallet" | "other" = "other"

        if (method.type === "bank") {
          category = "bank_transfer"
        } else if (method.type === "ewallet") {
          category = "e_wallet"
        }

        let instructions = ""
        if (method.fields?.instructions?.value) {
          instructions = method.fields.instructions.value
        }

        const name = method.display_name || methodType.charAt(0).toUpperCase() + methodType.slice(1)

        return {
          id: String(method.id || ""),
          name,
          type: methodType,
          category,
          details: method.fields || {},
          instructions,
          isDefault: false,
        }
      })

      setPaymentMethods(transformedMethods)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment methods")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const addPaymentMethod = useCallback(
    async (method: string, fields: Record<string, string>) => {
      return await ProfileAPI.addPaymentMethod(method, fields)
    },
    []
  )

  const updatePaymentMethod = useCallback(async (id: string, fields: Record<string, any>) => {
    const paymentMethod = paymentMethods.find((m) => m.id === id)
    if (!paymentMethod) throw new Error("Payment method not found")

    const payload = {
      method: paymentMethod.type,
      fields: { ...fields },
    }

    return await ProfileAPI.updatePaymentMethod(id, payload)
  }, [paymentMethods])

  const deletePaymentMethod = useCallback(async (id: string) => {
    return await ProfileAPI.deletePaymentMethod(id)
  }, [])

  const refresh = useCallback(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  return {
    paymentMethods,
    isLoading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refresh,
    bankTransfers: paymentMethods.filter((m) => m.category === "bank_transfer"),
    eWallets: paymentMethods.filter((m) => m.category === "e_wallet"),
  }
}
