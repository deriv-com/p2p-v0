"use client"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { API, AUTH } from "@/lib/local-variables"

interface PaymentMethod {
  id: string
  display_name: string
  method: string
  type: string
  fields: Record<string, any>
  is_enabled: boolean
}

export default function AdPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const headers = AUTH.getAuthHeader()
        const response = await fetch(`${API.baseUrl}${API.endpoints.paymentMethods}`, {
          headers,
        })
        const responseData = await response.json()

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setPaymentMethods(responseData.data)
        } else {
          setPaymentMethods([])
        }
      } catch {
        setPaymentMethods([])
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  const handleMethodToggle = (methodId: string, checked: boolean) => {
    if (checked) {
      setSelectedMethods((prev) => [...prev, methodId])
    } else {
      setSelectedMethods((prev) => prev.filter((id) => id !== methodId))
    }
  }

  useEffect(() => {
    // Store selected payment method IDs globally for form submission
    ;(window as any).adPaymentMethodIds = selectedMethods
  }, [selectedMethods])

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold leading-6 tracking-normal">Payment methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold leading-6 tracking-normal">Payment methods</h3>
      <p className="text-sm text-gray-600 mb-4">Select the payment methods you want to use for this ad.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              !method.is_enabled ? "opacity-50 cursor-not-allowed" : ""
            } ${selectedMethods.includes(method.id) ? "ring-2 ring-black" : ""}`}
            onClick={() => {
              if (method.is_enabled) {
                handleMethodToggle(method.id, !selectedMethods.includes(method.id))
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={method.id}
                  checked={selectedMethods.includes(method.id)}
                  disabled={!method.is_enabled}
                  onCheckedChange={(checked) => {
                    if (method.is_enabled) {
                      handleMethodToggle(method.id, checked as boolean)
                    }
                  }}
                  className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
                <label
                  htmlFor={method.id}
                  className={`text-sm font-medium cursor-pointer ${
                    !method.is_enabled ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {method.display_name}
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentMethods.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No payment methods available</p>
        </div>
      )}
    </div>
  )
}
