"use client"

import { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { API, AUTH } from "@/lib/local-variables"

interface PaymentMethod {
  id: string
  display_name: string
  method: string
  type: string
  fields: Record<string, any>
}

export default function AdPaymentMethods() {
  const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const getPaymentMethodColour = (type: string): string => {
    if (type === "bank") {
      return "bg-paymentMethod-bank"
    } else {
      return "bg-paymentMethod-ewallet"
    }
  }

  useEffect(() => {
    const fetchUserPaymentMethods = async () => {
      try {
        const headers = AUTH.getAuthHeader()
        const response = await fetch(`${API.baseUrl}${API.endpoints.userPaymentMethods}`, {
          headers,
        })
        const responseData = await response.json()

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setUserPaymentMethods(responseData.data)
        } else {
          setUserPaymentMethods([])
        }
      } catch {
        setUserPaymentMethods([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserPaymentMethods()
  }, [])

  useEffect(() => {
    ;(window as any).adPaymentMethodIds = selectedPaymentMethods
  }, [selectedPaymentMethods])

  const togglePaymentMethod = (methodId: string) => {
    setSelectedPaymentMethods((prev) => {
      if (prev.includes(methodId)) {
        return prev.filter((id) => id !== methodId)
      } else {
        return [...prev, methodId]
      }
    })
  }

  const handleAddPaymentMethod = () => {
    // This would typically open a modal or navigate to add payment method page
    console.log("Add payment method clicked")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold leading-6 tracking-normal">Select payment method</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold leading-6 tracking-normal">Select payment method</h3>

      <div className="space-y-3">
        {userPaymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedPaymentMethods.includes(method.id)
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => togglePaymentMethod(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${getPaymentMethodColour(method.type)} rounded-full w-6 h-6`} />
                  <div>
                    <p className="font-medium text-sm">{method.display_name}</p>
                    <p className="text-xs text-gray-500">
                      {method.fields?.account_number || method.fields?.bank_name || "Payment method"}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedPaymentMethods.includes(method.id) ? "bg-black border-black" : "border-gray-300"
                  }`}
                >
                  {selectedPaymentMethods.includes(method.id) && <X className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full h-16 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 bg-transparent"
          onClick={handleAddPaymentMethod}
        >
          <Plus className="w-5 h-5 mr-2" />
          Select a payment method
        </Button>
      </div>

      {selectedPaymentMethods.length > 0 && (
        <p className="text-sm text-gray-600">
          {selectedPaymentMethods.length} payment method{selectedPaymentMethods.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  )
}
