"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getPaymentMethods } from "@/services/api/api-buy-sell"
import { getPaymentMethodFields, getPaymentMethodIcon, type AvailablePaymentMethod } from "@/lib/utils"

interface AddPaymentMethodPanelProps {
  onClose: () => void
  onAdd: (method: string, fields: Record<string, string>) => void
  isLoading: boolean
}

interface PanelWrapperProps {
  onClose: () => void
  children: React.ReactNode
}

function PanelWrapper({ onClose, children }: PanelWrapperProps) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col">
      <div className="p-6 border-b relative">
        <h2 className="text-xl font-semibold">Add payment method</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-10 w-10 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      {children}
    </div>
  )
}

export default function AddPaymentMethodPanel({ onClose, onAdd, isLoading }: AddPaymentMethodPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [details, setDetails] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [charCount, setCharCount] = useState(0)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([])
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)

  useEffect(() => {
    const fetchAvailablePaymentMethods = async () => {
      try {
        setIsLoadingMethods(true)

        const response = await getPaymentMethods()

        if (response && response.data && Array.isArray(response.data)) {
          setAvailablePaymentMethods(response.data)
        } else if (Array.isArray(response)) {
          setAvailablePaymentMethods(response)
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingMethods(false)
      }
    }

    fetchAvailablePaymentMethods()
  }, [])

  useEffect(() => {
    setDetails({})
    setErrors({})
    setTouched({})
  }, [selectedMethod])

  useEffect(() => {
    setCharCount(instructions.length)
  }, [instructions])

  const selectedMethodFields = getPaymentMethodFields(selectedMethod, availablePaymentMethods)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedMethod) {
      newErrors.method = "Please select a payment method"
    }

    selectedMethodFields.forEach((field) => {
      if (!details[field.name]?.trim() && field.required) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (name: string, value: string) => {
    setDetails((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedMethodFields.length > 0) {
      const allTouched: Record<string, boolean> = {}
      selectedMethodFields.forEach((field) => {
        allTouched[field.name] = true
      })
      setTouched(allTouched)
    }

    if (validateForm()) {
      const fieldValues = { ...details }

      fieldValues.instructions = instructions.trim() || "-"

      if (selectedMethod === "bank_transfer") {
        fieldValues.bank_code = fieldValues.bank_code || "-"
        fieldValues.branch = fieldValues.branch || "-"
      }

      onAdd(selectedMethod, fieldValues)
    }
  }

  const isFormValid = () => {
    if (!selectedMethod) return false

    return selectedMethodFields.every((field) => {
      if (field.required) {
        return details[field.name]?.trim()
      }
      return true
    })
  }

  if (isLoadingMethods) {
    return (
      <PanelWrapper onClose={onClose}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading payment methods...</div>
        </div>
      </PanelWrapper>
    )
  }

  if (availablePaymentMethods.length === 0 && !isLoadingMethods) {
    return (
      <PanelWrapper onClose={onClose}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">No payment methods available</div>
        </div>
      </PanelWrapper>
    )
  }

  return (
    <PanelWrapper onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">Choose your payment method</label>
            <div className="space-y-3">
              {availablePaymentMethods.map((paymentMethod) => (
                <Button
                  key={paymentMethod.method}
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedMethod(paymentMethod.method)}
                  className={`w-full p-4 justify-start gap-3 h-auto rounded-lg border ${selectedMethod === paymentMethod.method
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <Image
                    src={getPaymentMethodIcon(paymentMethod.type) || "/placeholder.svg"}
                    alt={paymentMethod.display_name}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{paymentMethod.display_name}</span>
                </Button>
              ))}
            </div>
            {errors.method && <p className="mt-2 text-xs text-red-500">{errors.method}</p>}
          </div>

          {selectedMethodFields.length > 0 && (
            <div className="space-y-4">
              {selectedMethodFields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-500 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    id={field.name}
                    type={field.type}
                    value={details[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                  {touched[field.name] && errors[field.name] && (
                    <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedMethod && (
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-500 mb-2">
                Instructions
              </label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter your instructions"
                className="min-h-[120px] resize-none"
                maxLength={300}
              />
              <div className="flex justify-end mt-1 text-xs text-gray-500">{charCount}/300</div>
            </div>
          )}
        </div>
      </form>

      <div className="p-6 border-t">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !selectedMethod || !isFormValid()}
          size="sm"
        >
          {isLoading ? "Adding..." : "Add"}
        </Button>
      </div>
    </PanelWrapper>
  )
}
