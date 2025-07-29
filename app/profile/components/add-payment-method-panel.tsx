"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API, AUTH } from "@/lib/local-variables"
import Image from "next/image"

interface PaymentMethodField {
  display_name: string
  required: boolean
  type: string
}

interface AvailablePaymentMethod {
  display_name: string
  method: string
  type: string
  fields: Record<string, PaymentMethodField>
}

interface AddPaymentMethodPanelProps {
  onClose: () => void
  onAdd: (method: string, fields: Record<string, string>) => Promise<void>
  isLoading: boolean
}

export default function AddPaymentMethodPanel({ onClose, onAdd, isLoading }: AddPaymentMethodPanelProps) {
  const [availableMethods, setAvailableMethods] = useState<AvailablePaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [formFields, setFormFields] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAvailablePaymentMethods()
  }, [])

  const fetchAvailablePaymentMethods = async () => {
    try {
      const url = `${API.baseUrl}/payment-methods`
      const headers = AUTH.getAuthHeader()
      const response = await fetch(url, { headers })

      if (response.ok) {
        const data = await response.json()
        setAvailableMethods(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
    }
  }

  const handleMethodSelect = (methodName: string) => {
    setSelectedMethod(methodName)
    setFormFields({})
  }

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormFields(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMethod) return

    await onAdd(selectedMethod, formFields)
  }

  const selectedMethodData = availableMethods.find(m => m.method === selectedMethod)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Image src="/icons/plus_icon.png" alt="Add" width={20} height={20} />
              Add Payment Method
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={selectedMethod} onValueChange={handleMethodSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a payment method" />
                </SelectTrigger>
                <SelectContent>
                  {availableMethods.map((method) => (
                    <SelectItem key={method.method} value={method.method}>
                      {method.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMethodData && (
              <div className="space-y-4">
                {Object.entries(selectedMethodData.fields).map(([fieldName, fieldData]) => (
                  <div key={fieldName}>
                    <Label htmlFor={fieldName}>
                      {fieldData.display_name}
                      {fieldData.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={fieldName}
                      type={fieldData.type === "number" ? "number" : "text"}
                      value={formFields[fieldName] || ""}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      required={fieldData.required}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!selectedMethod || isLoading}
              >
                {isLoading ? "Adding..." : "Add Method"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
